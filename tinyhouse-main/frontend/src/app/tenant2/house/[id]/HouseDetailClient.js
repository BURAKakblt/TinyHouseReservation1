'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useToast from "../../../../components/useToast";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function HouseDetailClient({ id }) {
  const router = useRouter();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState({
    startDate: "",
    endDate: ""
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookedDates, setBookedDates] = useState([]);
  const [guests, setGuests] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const showToast = useToast();
  const [calendarValue, setCalendarValue] = useState([null, null]);
  const [validationError, setValidationError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [cardInfo, setCardInfo] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [reservationSummary, setReservationSummary] = useState(null);

  useEffect(() => {
    const fetchHouseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:5254/api/houses/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API'den gelen house:", data);
        console.log("API'den gelen house anahtarları:", Object.keys(data));
        setHouse({
          ...data,
          HouseID: data.HouseID || data.id || data.houseId || id
        });
        if (data.images && data.images.length > 0) {
          setSelectedImage(0);
        }
      } catch (err) {
        console.error('Ev detayları yüklenirken hata:', err);
        setError(err.message || 'Ev detayları yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchHouseDetails();

    // Dolu günleri çek
    fetch(`/api/houses/${id}/booked-dates`)
      .then(res => res.json())
      .then(setBookedDates);
  }, [id]);

  // Kişi sayısı ve fiyat güncelleme
  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
  }, [selectedDates, guests, house]);

  const calculateTotalPrice = () => {
    if (!selectedDates.startDate || !selectedDates.endDate || !house) return 0;
    
    const start = new Date(selectedDates.startDate);
    const end = new Date(selectedDates.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return days * house.pricePerNight * guests;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDates(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (selectedDates.startDate && selectedDates.endDate) {
      setTotalPrice(calculateTotalPrice());
    }
  };

  const isDateBooked = (date) => {
    return bookedDates.includes(date.toISOString().split('T')[0]);
  };

  // Doğrulama fonksiyonu
  const validateReservation = () => {
    setValidationError("");
    const email = localStorage.getItem("email");
    if (!email) {
      setValidationError("Rezervasyon için giriş yapmalısınız.");
      return false;
    }
    if (!selectedDates.startDate || !selectedDates.endDate) {
      setValidationError("Lütfen giriş ve çıkış tarihlerini seçiniz.");
      return false;
    }
    const today = new Date();
    const start = new Date(selectedDates.startDate);
    const end = new Date(selectedDates.endDate);
    if (start < today.setHours(0,0,0,0)) {
      setValidationError("Giriş tarihi geçmişte olamaz.");
      return false;
    }
    if (end <= start) {
      setValidationError("Çıkış tarihi, giriş tarihinden sonra olmalıdır.");
      return false;
    }
    if (guests < 1 || guests > (house?.maxGuests || 10)) {
      setValidationError(`Kişi sayısı 1 ile ${house?.maxGuests || 10} arasında olmalıdır.`);
      return false;
    }
    // Dolu gün kontrolü
    let d = new Date(start);
    while (d <= end) {
      if (isDateBooked(d)) {
        setValidationError("Seçilen tarihlerde ev dolu. Lütfen başka tarih seçin.");
        return false;
      }
      d.setDate(d.getDate() + 1);
    }
    return true;
  };

  const handleReservation = async () => {
    if (!validateReservation()) return;
    // Rezervasyon bilgilerini localStorage'a kaydet
    const realHouseID = house.HouseID || house.id || house.houseId;
    console.log("Kullanılan HouseID:", realHouseID);
    localStorage.setItem("pendingReservation", JSON.stringify({
      houseID: realHouseID,
      houseTitle: house.title,
      startDate: selectedDates.startDate,
      endDate: selectedDates.endDate,
      guests,
      totalPrice
    }));
    router.push("/tenant2/payment");
  };

  const handlePayment = async () => {
    if (!cardInfo.number || !cardInfo.name || !cardInfo.expiry || !cardInfo.cvc) {
      setValidationError("Lütfen tüm kart bilgilerini doldurun.");
      return;
    }
    setValidationError("");
    try {
      const email = localStorage.getItem("email");
      const response = await fetch("http://localhost:5254/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          HouseID: house.HouseID,
          Email: email,
          StartDate: selectedDates.startDate,
          EndDate: selectedDates.endDate,
          TotalPrice: totalPrice,
          Guests: guests
        })
      });
      if (response.ok) {
        // Gerçek e-posta gönderimi
        console.log("Mail gönderme isteği başlatılıyor:", {
          tenantEmail: email,
          ownerEmail: house.ownerEmail || "evsahibi@example.com",
          houseTitle: house.title,
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate,
          guests,
          totalPrice
        });
        const mailRes = await fetch("http://localhost:5254/api/send-reservation-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantEmail: email,
            ownerEmail: house.ownerEmail || "evsahibi@example.com",
            houseTitle: house.title,
            startDate: selectedDates.startDate,
            endDate: selectedDates.endDate,
            guests,
            totalPrice
          })
        });
        console.log("Mail gönderme isteği tamamlandı. Yanıt:", mailRes);
        if (!mailRes.ok) {
          const mailErr = await mailRes.json().catch(() => ({}));
          showToast({ message: (mailErr.message ? mailErr.message + ' (Detay: ' + (mailErr.error || '') + ')' : "E-posta gönderilemedi"), type: "error" });
          console.error("E-posta gönderilemedi:", mailErr);
        }
        setReservationSummary({
          houseTitle: house.title,
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate,
          guests,
          totalPrice
        });
        showToast({ message: "Rezervasyon ve ödeme başarılı!", type: "success" });
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
        return;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Rezervasyon yapılırken bir hata oluştu");
    } catch (error) {
      setValidationError(error.message || "Rezervasyon yapılırken bir hata oluştu");
      showToast({ message: error.message || "Rezervasyon yapılırken bir hata oluştu", type: "error" });
    }
  };

  const featuresArray = house && house.features
    ? (typeof house.features === "string"
        ? house.features.split(",").map(f => f.trim()).filter(f => f)
        : Array.isArray(house.features)
          ? house.features
          : [])
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#260B01] mx-auto"></div>
          <p className="mt-4 text-gray-800 font-medium">Yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-red-600"
        >
          <p className="font-medium">Hata: {error}</p>
          <button
            onClick={() => router.push("/tenant2")}
            className="mt-4 bg-[#260B01] text-white px-4 py-2 rounded hover:bg-[#3e2010] transition"
          >
            Ana Sayfaya Dön
          </button>
        </motion.div>
      </div>
    );
  }

  if (!house) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Geri Dön Butonu */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="mb-6 flex items-center text-[#260B01] hover:text-[#3e2010] transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri Dön
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Ev Detayları */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ev Başlığı ve Fiyat */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-100"
            >
              <h1 className="text-3xl font-bold text-black mb-4">{house.title}</h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="ml-2 text-gray-800">{house.rating || "Yeni"}</span>
                </div>
                <div className="text-2xl font-semibold text-black">
                  {house.pricePerNight} TL/gece
                </div>
              </div>
            </motion.div>

            {/* Ev Fotoğrafları */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="relative">
                <img
                  src={house.images && house.images[selectedImage] ? `http://localhost:5254${house.images[selectedImage]}` : (house.coverImageUrl ? `http://localhost:5254${house.coverImageUrl}` : "/default-house.jpg")}
                  alt={house.title}
                  className="w-full h-96 object-cover"
                />
                {house.images && house.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {house.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-3 h-3 rounded-full transition ${
                          selectedImage === index ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {house.images && house.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {house.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                        selectedImage === index ? "border-[#260B01]" : "border-transparent"
                      }`}
                    >
                      <img
                        src={`http://localhost:5254${image}`}
                        alt={`${house.title} - Fotoğraf ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Ev Özellikleri */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-semibold text-black mb-6">Ev Özellikleri</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-[#260B01] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-gray-800">{house.houseType}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-[#260B01] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-800">{house.city}, {house.country}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-[#260B01] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <span className="text-gray-800">{house.maxGuests} Kişilik</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-[#260B01] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-gray-800">{house.bedrooms} Yatak Odası</span>
                </div>
              </div>
            </motion.div>

            {/* Ev Açıklaması */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-semibold text-black mb-6">Açıklama</h2>
              <p className="text-gray-800 leading-relaxed">{house.description}</p>
            </motion.div>

            {/* Özellikler */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-semibold text-black mb-6">Özellikler</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {featuresArray.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-[#260B01] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2 text-black">Müsaitlik Takvimi</h2>
              <Calendar
                selectRange={true}
                value={calendarValue}
                onChange={val => {
                  setCalendarValue(val);
                  if (val && val[0] && val[1]) {
                    setSelectedDates({
                      startDate: val[0].toISOString().split('T')[0],
                      endDate: val[1].toISOString().split('T')[0]
                    });
                  }
                }}
                tileDisabled={({ date }) => isDateBooked(date)}
                tileClassName={({ date }) =>
                  isDateBooked(date)
                    ? 'bg-red-200 text-red-700 cursor-not-allowed'
                    : 'bg-green-100 text-green-800'
                }
              />
              <div className="mt-2 text-sm">
                <span className="inline-block w-3 h-3 bg-green-100 border border-green-800 mr-2"></span> Müsait
                <span className="inline-block w-3 h-3 bg-red-200 border border-red-700 ml-4 mr-2"></span> Dolu
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Rezervasyon Formu ve Ev Özeti */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            {/* Ev Özet Kartı */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
              <img
                src={house.coverImageUrl ? `http://localhost:5254${house.coverImageUrl}` : "/default-house.jpg"}
                alt={house.title}
                className="w-full h-32 object-cover rounded mb-3"
              />
              <h3 className="text-lg font-bold text-black mb-1">{house.title}</h3>
              <div className="text-gray-700 text-sm mb-1">{house.city}, {house.country}</div>
              <div className="text-yellow-600 font-bold mb-1">★ {house.rating || "Yeni"}</div>
              <div className="text-gray-800 text-sm">{house.pricePerNight} TL/gece</div>
            </div>
            {/* Rezervasyon Formu */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 sticky top-8">
              <h2 className="text-2xl font-semibold text-black mb-6">Rezervasyon Yap</h2>
              <div className="mb-4 text-gray-700 text-sm">Giriş yapan: <span className="font-bold">{localStorage.getItem("email")}</span></div>
              {validationError && (
                <div className="mb-4 text-red-600 font-semibold">{validationError}</div>
              )}
              {showSuccess && reservationSummary && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-8 py-6 rounded-xl shadow-2xl z-50 animate-bounce-in flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 mb-2 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="text-2xl font-bold">Rezervasyon Başarılı!</div>
                  <div className="mt-2 text-lg">{reservationSummary.houseTitle}</div>
                  <div className="text-sm">Tarih: <b>{reservationSummary.startDate}</b> - <b>{reservationSummary.endDate}</b></div>
                  <div className="text-sm">Kişi: <b>{reservationSummary.guests}</b></div>
                  <div className="text-sm">Toplam Fiyat: <b>{reservationSummary.totalPrice} TL</b></div>
                  <button
                    onClick={() => router.push("/tenant2/my-reservations")}
                    className="mt-4 bg-white text-green-700 font-bold px-6 py-2 rounded shadow hover:bg-green-100 transition"
                  >
                    Rezervasyonlarım
                  </button>
                </div>
              )}
              {!showPayment ? (
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Giriş Tarihi</label>
                    <DatePicker
                      selected={selectedDates.startDate ? new Date(selectedDates.startDate) : null}
                      onChange={date => setSelectedDates(prev => ({ ...prev, startDate: date ? date.toISOString().split('T')[0] : "" }))}
                      excludeDates={bookedDates.map(d => new Date(d))}
                      placeholderText="Giriş Tarihi"
                      minDate={new Date()}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Çıkış Tarihi</label>
                    <DatePicker
                      selected={selectedDates.endDate ? new Date(selectedDates.endDate) : null}
                      onChange={date => setSelectedDates(prev => ({ ...prev, endDate: date ? date.toISOString().split('T')[0] : "" }))}
                      excludeDates={bookedDates.map(d => new Date(d))}
                      placeholderText="Çıkış Tarihi"
                      minDate={selectedDates.startDate ? new Date(selectedDates.startDate) : new Date()}
                      disabled={!selectedDates.startDate}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Kişi Sayısı <span className="text-xs text-gray-500">(En fazla {house.maxGuests || 10})</span></label>
                    <input
                      type="number"
                      value={guests}
                      min={1}
                      max={house?.maxGuests || 10}
                      onChange={e => setGuests(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition text-black"
                    />
                  </div>
                  {totalPrice > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-800">Toplam Fiyat:</span>
                        <span className="text-xl font-semibold text-black">{totalPrice} TL</span>
                      </div>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleReservation}
                    className="w-full bg-[#260B01] text-white py-3 rounded-lg hover:bg-[#3e2010] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Devam Et ve Öde
                  </motion.button>
                </form>
              ) : (
                <form className="space-y-6">
                  <div className="mb-2 text-gray-800 font-semibold">Toplam Ödeme: <span className="text-xl text-black">{totalPrice} TL</span></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Kart Numarası</label>
                    <input type="text" value={cardInfo.number} onChange={e => setCardInfo({ ...cardInfo, number: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Kart Üzerindeki İsim</label>
                    <input type="text" value={cardInfo.name} onChange={e => setCardInfo({ ...cardInfo, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" placeholder="Ad Soyad" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-800 mb-2">Son Kullanma</label>
                      <input type="text" value={cardInfo.expiry} onChange={e => setCardInfo({ ...cardInfo, expiry: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" placeholder="AA/YY" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-800 mb-2">CVC</label>
                      <input type="text" value={cardInfo.cvc} onChange={e => setCardInfo({ ...cardInfo, cvc: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" placeholder="123" />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePayment}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Ödemeyi Tamamla
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <style jsx global>{`
@keyframes bounce-in {
  0% { transform: scale(0.8) translateY(-30px); opacity: 0; }
  60% { transform: scale(1.05) translateY(10px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.animate-bounce-in { animation: bounce-in 0.7s; }
`}</style>
    </motion.div>
  );
} 