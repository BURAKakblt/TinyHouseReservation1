'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
        if (!data) {
          throw new Error('Ev detayları bulunamadı');
        }
        
        setHouse(data);
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
  }, [id]);

  const calculateTotalPrice = () => {
    if (!selectedDates.startDate || !selectedDates.endDate || !house) return 0;
    
    const start = new Date(selectedDates.startDate);
    const end = new Date(selectedDates.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return days * house.pricePerNight;
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

  const handleReservation = async () => {
    try {
      const email = localStorage.getItem("email");
      if (!email) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:5254/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          houseID: house.houseID,
          email: email,
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate,
          totalAmount: totalPrice
        })
      });

      if (!response.ok) {
        throw new Error("Rezervasyon yapılırken bir hata oluştu");
      }

      alert("Rezervasyon başarıyla oluşturuldu!");
      router.push("/tenant2/my-reservations");
    } catch (error) {
      console.error("Rezervasyon hatası:", error);
      alert("Rezervasyon yapılırken bir hata oluştu");
    }
  };

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
                {house.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-[#260B01] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sağ Kolon - Rezervasyon Formu */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 sticky top-8">
              <h2 className="text-2xl font-semibold text-black mb-6">Rezervasyon Yap</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Giriş Tarihi</label>
                  <input
                    type="date"
                    name="startDate"
                    value={selectedDates.startDate}
                    onChange={handleDateChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Çıkış Tarihi</label>
                  <input
                    type="date"
                    name="endDate"
                    value={selectedDates.endDate}
                    onChange={handleDateChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition"
                    min={selectedDates.startDate || new Date().toISOString().split('T')[0]}
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
                  disabled={!selectedDates.startDate || !selectedDates.endDate}
                  className="w-full bg-[#260B01] text-white py-3 rounded-lg hover:bg-[#3e2010] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rezervasyon Yap
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 