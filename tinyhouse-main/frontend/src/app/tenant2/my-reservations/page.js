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

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem("email");
      const response = await fetch(`http://localhost:5254/api/reservations/user/${email}`);
      
      if (!response.ok) {
        throw new Error("Rezervasyonlar yüklenemedi");
      }
      
      const data = await response.json();
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm("Bu rezervasyonu iptal etmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5254/api/reservations/${reservationId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Rezervasyon iptal edilemedi");
      }

      alert("Rezervasyon başarıyla iptal edildi");
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
    if (!selectedReservation) return;

    setIsSubmittingReview(true);
    try {
      const response = await fetch("http://localhost:5254/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          houseId: selectedReservation.house.id,
          reservationId: selectedReservation.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          email: localStorage.getItem("email"),
        }),
      });

      if (!response.ok) {
        throw new Error("Değerlendirme kaydedilemedi");
      }

      alert("Değerlendirmeniz başarıyla kaydedildi!");
      setSelectedReservation(null);
      setReviewForm({ rating: 0, comment: "" });
      fetchReservations();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
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
                          onClick={() =>
                            router.push(`/tenant2/reservation-confirmation/${reservation.id}`)
                          }
                          className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                        >
                          Detaylar
                        </button>
                        {getReservationStatus(reservation) === "upcoming" && (
                          <button
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
                          >
                            İptal Et
                          </button>
                        )}
                        {getReservationStatus(reservation) === "completed" && !reservation.review && (
                          <button
                            onClick={() => setSelectedReservation(reservation)}
                            className="bg-green-100 text-green-600 px-4 py-2 rounded hover:bg-green-200"
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

        {/* Değerlendirme Modal */}
        {selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-semibold mb-4">
                {selectedReservation.house.title} - Değerlendirme
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puanınız
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-3xl focus:outline-none"
                      >
                        {star <= reviewForm.rating ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yorumunuz
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    rows="4"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Deneyiminizi paylaşın..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReservation(null);
                      setReviewForm({ rating: 0, comment: "" });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview || reviewForm.rating === 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {isSubmittingReview ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 