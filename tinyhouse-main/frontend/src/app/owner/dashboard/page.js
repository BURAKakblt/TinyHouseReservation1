"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaHome,
  FaCalendarAlt,
  FaComments,
  FaMoneyBillWave,
  FaChartLine,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OwnerDashboard = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [houses, setHouses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewResponse, setReviewResponse] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    if (!storedEmail || storedRole !== "owner") {
      router.push("/login");
      return;
    }
    setEmail(storedEmail);
    fetchOwnerData(storedEmail);
  }, []);

  const fetchOwnerData = async (ownerEmail) => {
    try {
      // Ev sahibinin evlerini getir
      const housesResponse = await fetch(
        `http://localhost:5254/api/houses/by-owner?email=${ownerEmail}`
      );
      const housesData = await housesResponse.json();
      setHouses(housesData);

      // Rezervasyonları getir
      const reservationsResponse = await fetch(
        `http://localhost:5254/api/reservations/by-owner?email=${ownerEmail}`
      );
      const reservationsData = await reservationsResponse.json();
      setReservations(reservationsData);

      // Yorumları getir
      const reviewsResponse = await fetch(
        `http://localhost:5254/api/reviews/by-owner?email=${ownerEmail}`
      );
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);

      // Ödemeleri getir
      const paymentsResponse = await fetch(
        `http://localhost:5254/api/payments/by-owner?email=${ownerEmail}`
      );
      const paymentsData = await paymentsResponse.json();
      setPayments(paymentsData);

      setLoading(false);
    } catch (error) {
      console.error("Veri getirme hatası:", error);
      setError("Veriler yüklenirken bir hata oluştu.");
      setLoading(false);
    }
  };

  // İlan durumunu güncelle
  const handleToggleStatus = async (houseID, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5254/api/houses/${houseID}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (response.ok) {
        // Başarıyla güncellendi, ilanları tekrar çek
        fetchOwnerData(email);
      } else {
        alert('Durum güncellenemedi!');
      }
    } catch (err) {
      alert('Sunucu hatası!');
    }
  };

  // Rezervasyon durumunu güncelle
  const handleReservationStatus = async (reservationId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5254/api/reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchOwnerData(email);
        setShowReservationModal(false);
      } else {
        alert('Rezervasyon durumu güncellenemedi!');
      }
    } catch (err) {
      alert('Sunucu hatası!');
    }
  };

  // Yorum cevabını güncelle
  const handleReviewResponse = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:5254/api/reviews/${reviewId}/response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: reviewResponse })
      });
      if (response.ok) {
        fetchOwnerData(email);
        setShowReviewModal(false);
        setReviewResponse("");
      } else {
        alert('Cevap kaydedilemedi!');
      }
    } catch (err) {
      alert('Sunucu hatası!');
    }
  };

  // Gelir raporu için veri hazırla
  const prepareIncomeData = () => {
    const monthlyData = {};
    const houseData = {};

    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const house = houses.find(h => h.houseID === payment.houseID);

      // Aylık gelir
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount;

      // Ev bazlı gelir
      if (house) {
        houseData[house.title] = (houseData[house.title] || 0) + payment.amount;
      }
    });

    return {
      monthlyData,
      houseData
    };
  };

  if (loading) return <div className="p-8">Yükleniyor...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Üst Menü */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-black">Ev Sahibi Paneli</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5 flex flex-col items-center">
              <span className="text-2xl font-bold text-black">{houses.length}</span>
              <span className="text-sm font-semibold text-black mt-1">Toplam İlan</span>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5 flex flex-col items-center">
              <span className="text-2xl font-bold text-black">{reservations.filter(r => r.status === "active").length}</span>
              <span className="text-sm font-semibold text-black mt-1">Aktif Rezervasyon</span>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5 flex flex-col items-center">
              <span className="text-2xl font-bold text-black">₺{payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</span>
              <span className="text-sm font-semibold text-black mt-1">Toplam Gelir</span>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5 flex flex-col items-center">
              <span className="text-2xl font-bold text-black">{reviews.length}</span>
              <span className="text-sm font-semibold text-black mt-1">Toplam Yorum</span>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5 flex flex-col items-center">
              <span className="text-2xl font-bold text-black">{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : '-'}</span>
              <span className="text-sm font-semibold text-black mt-1">Ortalama Puan</span>
            </div>
          </div>
        </div>
        {/* Grafik Alanı (isteğe bağlı) */}
        <div className="bg-white shadow rounded-lg border border-gray-200 mb-8 p-6 flex flex-col items-center">
          <span className="text-lg font-bold text-black mb-2">Rezervasyonlar / Gelir Grafiği (Yakında)</span>
          <div className="w-full h-32 flex items-center justify-center text-gray-400">Grafik alanı placeholder</div>
        </div>

        {/* Gelir Raporları */}
        <div className="bg-white shadow rounded-lg mb-8 border border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-xl font-bold text-black">Gelir Raporları</h2>
          </div>
          <div className="border-t border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aylık Gelir Grafiği */}
              <div>
                <h3 className="text-lg font-bold text-black mb-4">Aylık Gelir</h3>
                <Bar
                  data={{
                    labels: Object.keys(prepareIncomeData().monthlyData).map(key => {
                      const [year, month] = key.split('-');
                      return `${month}/${year}`;
                    }),
                    datasets: [
                      {
                        label: 'Aylık Gelir (₺)',
                        data: Object.values(prepareIncomeData().monthlyData),
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </div>

              {/* En Çok Gelir Getiren Evler */}
              <div>
                <h3 className="text-lg font-bold text-black mb-4">En Çok Gelir Getiren Evler</h3>
                <div className="space-y-4">
                  {Object.entries(prepareIncomeData().houseData)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([house, amount]) => (
                      <div key={house} className="flex justify-between items-center">
                        <span className="text-black">{house}</span>
                        <span className="font-bold text-black">₺{amount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ödemeler Tablosu */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-xl font-bold text-black">Ödeme Geçmişi</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ev</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Rezervasyon</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tutar</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ödeme Yöntemi</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.paymentID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {houses.find((h) => h.houseID === payment.houseID)?.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {new Date(payment.startDate).toLocaleDateString()} - {new Date(payment.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">₺{payment.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{payment.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === "completed" ? "bg-green-100 text-green-800" :
                          payment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {payment.status === "completed" ? "Tamamlandı" :
                           payment.status === "pending" ? "Beklemede" : "İptal"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* İlanlar Listesi */}
        <div className="bg-white shadow rounded-lg mb-8 border border-gray-200">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">İlanlarım</h2>
            <Link
              href="/owner/add-house"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              Yeni İlan Ekle
            </Link>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Kapak</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Başlık</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Fiyat</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Eklenme Tarihi</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {houses.map((house) => (
                    <tr key={house.houseID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img className="h-12 w-12 rounded object-cover border border-gray-300" src={house.coverImageUrl} alt="Kapak" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-black font-bold">{house.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{house.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">₺{house.pricePerNight}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{house.createdAt ? new Date(house.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${house.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{house.isActive ? "Aktif" : "Pasif"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        <Link
                          href={`/owner/edit-house/${house.houseID}`}
                          className="text-indigo-700 hover:text-indigo-900 font-bold"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(house.houseID, house.isActive)}
                          className="text-yellow-700 hover:text-yellow-900 font-bold"
                        >
                          Durum Değiştir
                        </button>
                        <button
                          onClick={() => handleDeleteHouse(house.houseID)}
                          className="text-red-700 hover:text-red-900 font-bold"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Son Rezervasyonlar */}
        <div className="bg-white shadow rounded-lg mb-8 border border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-xl font-bold text-black">Son Rezervasyonlar</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ev</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Kiracı</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tutar</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.slice(0, 5).map((reservation) => (
                    <tr key={reservation.reservationID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{houses.find((h) => h.houseID === reservation.houseID)?.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{reservation.tenantEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">
                          {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">₺{reservation.totalPrice}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reservation.status === "active" ? "bg-green-100 text-green-800" :
                          reservation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {reservation.status === "active" ? "Aktif" :
                           reservation.status === "pending" ? "Beklemede" : "İptal"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowReservationModal(true);
                          }}
                          className="text-indigo-700 hover:text-indigo-900 font-bold mr-2"
                        >
                          Detaylar
                        </button>
                        {reservation.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleReservationStatus(reservation.reservationID, "active")}
                              className="text-green-700 hover:text-green-900 font-bold mr-2"
                            >
                              Kabul Et
                            </button>
                            <button
                              onClick={() => handleReservationStatus(reservation.reservationID, "cancelled")}
                              className="text-red-700 hover:text-red-900 font-bold"
                            >
                              Reddet
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rezervasyon Detay Modalı */}
        {showReservationModal && selectedReservation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-bold text-black mb-4">Rezervasyon Detayları</h3>
                <div className="space-y-3">
                  <p className="text-black">
                    <span className="font-bold">Ev:</span> {houses.find((h) => h.houseID === selectedReservation.houseID)?.title}
                  </p>
                  <p className="text-black">
                    <span className="font-bold">Kiracı:</span> {selectedReservation.tenantEmail}
                  </p>
                  <p className="text-black">
                    <span className="font-bold">Giriş Tarihi:</span> {new Date(selectedReservation.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-black">
                    <span className="font-bold">Çıkış Tarihi:</span> {new Date(selectedReservation.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-black">
                    <span className="font-bold">Toplam Tutar:</span> ₺{selectedReservation.totalPrice}
                  </p>
                  <p className="text-black">
                    <span className="font-bold">Durum:</span>{" "}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedReservation.status === "active" ? "bg-green-100 text-green-800" :
                      selectedReservation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {selectedReservation.status === "active" ? "Aktif" :
                       selectedReservation.status === "pending" ? "Beklemede" : "İptal"}
                    </span>
                  </p>
                  {selectedReservation.status === "pending" && (
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => handleReservationStatus(selectedReservation.reservationID, "active")}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Kabul Et
                      </button>
                      <button
                        onClick={() => handleReservationStatus(selectedReservation.reservationID, "cancelled")}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowReservationModal(false)}
                    className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Son Yorumlar */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-xl font-bold text-black">Son Yorumlar</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Ev</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Kiracı</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Puan</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Yorum</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Cevap</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.slice(0, 5).map((review) => (
                    <tr key={review.reviewID}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{houses.find((h) => h.houseID === review.houseID)?.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{review.tenantEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-black">{review.rating}/5</span>
                          <div className="ml-2 flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-black">{review.comment}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-black">{review.response || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setReviewResponse(review.response || "");
                            setShowReviewModal(true);
                          }}
                          className="text-indigo-700 hover:text-indigo-900 font-bold"
                        >
                          {review.response ? 'Cevabı Düzenle' : 'Cevap Yaz'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Yorum Detay Modalı */}
        {showReviewModal && selectedReview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-bold text-black mb-4">Yorum Detayları</h3>
                <div className="space-y-3">
                  <p className="text-black">
                    <span className="font-bold">Ev:</span> {houses.find((h) => h.houseID === selectedReview.houseID)?.title}
                  </p>
                  <p className="text-black">
                    <span className="font-bold">Kiracı:</span> {selectedReview.tenantEmail}
                  </p>
                  <p className="text-black">
                    <span className="font-bold">Puan:</span> {selectedReview.rating}/5
                  </p>
                  <p className="text-black">
                    <span className="font-bold">Yorum:</span> {selectedReview.comment}
                  </p>
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-black mb-2">
                      Cevabınız:
                    </label>
                    <textarea
                      value={reviewResponse}
                      onChange={(e) => setReviewResponse(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows="4"
                      placeholder="Cevabınızı buraya yazın..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => handleReviewResponse(selectedReview.reviewID)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewModal(false);
                        setReviewResponse("");
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard; 