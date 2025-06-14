"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyReservations() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, past, cancelled
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem("email");
      const response = await fetch(`http://localhost:5254/api/reservations/by-${email}`);
      
      if (!response.ok) {
        throw new Error("Rezervasyonlar yüklenemedi");
      }
      
      const data = await response.json();
      console.log("Gelen rezervasyonlar:", data);
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await fetch(`http://localhost:5254/api/reservations/${reservationId}/cancel`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Rezervasyon iptal edilemedi");
      }
      setCancelSuccess(true);
      setTimeout(() => setCancelSuccess(false), 2000);
      fetchReservations();
    } catch (err) {
      alert(err.message);
    }
  };

  const calculateCancellationFee = (reservation) => {
    const checkIn = new Date(reservation.checkIn);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));

    // İptal politikası:
    // 7 günden fazla: %20 iade
    // 3-7 gün: %50 iade
    // 3 günden az: İade yok
    if (daysUntilCheckIn > 7) {
      return reservation.totalPrice * 0.2;
    } else if (daysUntilCheckIn > 3) {
      return reservation.totalPrice * 0.5;
    } else {
      return reservation.totalPrice;
    }
  };

  const getReservationStatus = (reservation) => {
    const today = new Date();
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);

    if (reservation.status === "cancelled") {
      return "cancelled";
    } else if (reservation.status === "Paid") {
      // Backend'den yeni eklenen rezervasyonlar için
      if (today < checkIn) return "upcoming";
      if (today >= checkIn && today <= checkOut) return "active";
      if (today > checkOut) return "completed";
    } else if (today > checkOut) {
      return "completed";
    } else if (today >= checkIn && today <= checkOut) {
      return "active";
    } else {
      return "upcoming";
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const status = getReservationStatus(reservation);
    return status === activeTab;
  });

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewError("");
    try {
      const response = await fetch("http://localhost:5254/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          houseId: selectedReservation.house.id,
          reservationId: selectedReservation.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          email: localStorage.getItem("email"),
        }),
      });
      if (!response.ok) throw new Error("Değerlendirme kaydedilemedi");
      setShowReviewModal(false);
      setReviewForm({ rating: 0, comment: "" });
      fetchReservations();
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err.message || "Değerlendirme kaydedilemedi");
      setTimeout(() => setReviewError("") , 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Modal bileşeni
  const ReservationModal = ({ reservation, onClose }) => {
    if (!reservation) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-md relative animate-fadeIn">
          <button onClick={onClose} className="absolute top-3 right-3 text-white bg-purple-600 hover:bg-purple-700 rounded-full w-9 h-9 flex items-center justify-center text-2xl font-bold shadow-md transition">&times;</button>
          <h2 className="text-2xl font-extrabold mb-6 text-center text-purple-700 tracking-wide">Rezervasyon Detayları</h2>
          <div className="space-y-3 text-base">
            <div><span className="font-semibold text-gray-700">Ev:</span> <span className="text-gray-900 font-bold">{reservation.house.title}</span></div>
            <div><span className="font-semibold text-gray-700">Konum:</span> <span className="text-gray-900">{reservation.house.location || '-'}</span></div>
            <div><span className="font-semibold text-gray-700">Giriş Tarihi:</span> <span className="text-gray-900">{new Date(reservation.checkIn).toLocaleDateString()}</span></div>
            <div><span className="font-semibold text-gray-700">Çıkış Tarihi:</span> <span className="text-gray-900">{new Date(reservation.checkOut).toLocaleDateString()}</span></div>
            <div><span className="font-semibold text-gray-700">Kişi:</span> <span className="text-gray-900">{reservation.guests}</span></div>
            <div><span className="font-semibold text-gray-700">Toplam Fiyat:</span> <span className="text-green-700 font-bold text-lg">{reservation.totalPrice} TL</span></div>
            <div><span className="font-semibold text-gray-700">Durum:</span> <span className="inline-block px-2 py-1 rounded bg-purple-100 text-purple-700 font-semibold text-sm">{reservation.status}</span></div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Hata: {error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ReservationModal reservation={selectedReservation} onClose={() => setSelectedReservation(null)} />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Rezervasyonlarım</h1>
          <button
            onClick={() => router.push("/tenant2")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yeni Rezervasyon
          </button>
        </div>

        {/* Tab Menüsü */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "upcoming"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Yaklaşan
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "active"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "completed"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Tamamlanan
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === "cancelled"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              İptal Edilen
            </button>
          </div>
        </div>

        {/* Rezervasyon Listesi */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">
              {activeTab === "upcoming"
                ? "Yaklaşan rezervasyonunuz bulunmamaktadır."
                : activeTab === "active"
                ? "Aktif rezervasyonunuz bulunmamaktadır."
                : activeTab === "completed"
                ? "Tamamlanan rezervasyonunuz bulunmamaktadır."
                : "İptal edilen rezervasyonunuz bulunmamaktadır."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {reservation.house.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{reservation.house.location}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Giriş:</span>{" "}
                          {new Date(reservation.checkIn).toLocaleDateString("tr-TR")}
                        </div>
                        <div>
                          <span className="font-medium">Çıkış:</span>{" "}
                          {new Date(reservation.checkOut).toLocaleDateString("tr-TR")}
                        </div>
                        <div>
                          <span className="font-medium">Misafir:</span>{" "}
                          {reservation.guests} kişi
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                      <div className="text-lg font-semibold text-blue-600 mb-2">
                        {reservation.totalPrice} TL
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedReservation(reservation)}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
                        >
                          Detaylar
                        </button>
                        {getReservationStatus(reservation) === "upcoming" && (
                          <button
                            onClick={() => { setShowCancelModal(true); setCancelId(reservation.id); }}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
                          >
                            İptal Et
                          </button>
                        )}
                        {getReservationStatus(reservation) === "completed" && !reservation.review && (
                          <button
                            onClick={() => { setShowReviewModal(true); setSelectedReservation(reservation); }}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                          >
                            Değerlendir
                          </button>
                        )}
                      </div>
                      {getReservationStatus(reservation) === "upcoming" && (
                        <div className="mt-2 text-sm text-gray-500">
                          İptal ücreti: {calculateCancellationFee(reservation)} TL
                        </div>
                      )}
                      {reservation.review && (
                        <div className="mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span>{reservation.review.rating}/5</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Değerlendirme Modalı */}
        {showReviewModal && selectedReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <form onSubmit={handleReviewSubmit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-purple-700">Ev Değerlendir</h2>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-black">Puan:</label>
                <select
                  value={reviewForm.rating}
                  onChange={e => setReviewForm(f => ({ ...f, rating: Number(e.target.value) }))}
                  className="w-full border rounded px-3 py-2 text-black"
                  style={{ color: '#000', opacity: 1, background: '#fff' }}
                  required
                >
                  <option value={0} style={{ color: '#888' }}>Puan seçin</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n} style={{ color: '#000' }}>{n} Yıldız</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-black">Yorum:</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-black"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="bg-gray-300 px-4 py-2 rounded">Vazgeç</button>
                <button type="submit" disabled={isSubmittingReview} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                  Gönder
                </button>
              </div>
            </form>
          </div>
        )}

        {cancelSuccess && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50">
            Rezervasyon başarıyla iptal edildi!
          </div>
        )}

        {reviewSuccess && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50">
            Değerlendirmeniz başarıyla kaydedildi!
          </div>
        )}

        {reviewError && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-lg z-50">
            {reviewError}
          </div>
        )}

        {/* Modern İptal Onay Modali */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center">
              <h2 className="text-xl font-bold mb-4 text-red-600">Rezervasyonu İptal Et</h2>
              <p>Bu rezervasyonu iptal etmek istediğinize emin misiniz?</p>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={async () => {
                    await handleCancelReservation(cancelId);
                    setShowCancelModal(false);
                    setCancelId(null);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Evet, İptal Et
                </button>
                <button
                  onClick={() => { setShowCancelModal(false); setCancelId(null); }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 