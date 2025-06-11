"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in flex items-center gap-2">
      <span>✔️</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white font-bold">Kapat</button>
      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 0.3s; }
      `}</style>
    </div>
  );
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [houses, setHouses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState({ city: "", status: "", minPrice: "", maxPrice: "" });
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewResponse, setReviewResponse] = useState("");
  const [popularHouses, setPopularHouses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("email");
    const uid = localStorage.getItem("userId");
    setUserId(uid);
    
    // Popüler evleri getir
    fetch("http://localhost:5254/api/houses/popular")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPopularHouses(data);
        } else {
          console.error("API'den gelen veri bir dizi değil:", data);
          setPopularHouses([]);
        }
      })
      .catch(error => {
        console.error("Popüler evler yüklenirken hata oluştu:", error);
        setPopularHouses([]);
      });

    if (uid) {
      fetch(`http://localhost:5254/api/favorites/${uid}`)
        .then(res => res.json())
        .then(setFavorites);
    }
    if (!email) {
      router.push("/login");
      setError("Giriş yapmadınız. Lütfen tekrar giriş yapın.");
      setLoading(false);
      return;
    }
    fetchOwnerHouses(email);
    fetchOwnerStats(email);
  }, []);

  const fetchOwnerHouses = async (email) => {
    if (!email) return;
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5254/api/houses/by-owner?email=${email}`);
      if (!response.ok) {
        throw new Error("Evler yüklenemedi");
      }
      const data = await response.json();
      setHouses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerStats = async (email) => {
    try {
      const [resvRes, payRes, revRes] = await Promise.all([
        fetch(`http://localhost:5254/api/reservations/by-owner?email=${email}`),
        fetch(`http://localhost:5254/api/payments/by-owner?email=${email}`),
        fetch(`http://localhost:5254/api/reviews/by-owner?email=${email}`),
      ]);
      const [resv, pay, rev] = await Promise.all([
        resvRes.ok ? resvRes.json() : [],
        payRes.ok ? payRes.json() : [],
        revRes.ok ? revRes.json() : [],
      ]);
      setReservations(resv || []);
      setPayments(pay || []);
      setReviews(rev || []);
    } catch (err) {
      // Hata durumunda boş bırak
      setReservations([]);
      setPayments([]);
      setReviews([]);
    }
  };

  const handleDeleteHouse = async (houseId) => {
    setDeleting(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5254/api/houses/${houseId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error("Ev silinemedi");
      }
      setShowDeleteModal(false);
      setDeleteId(null);
      setToast("Ev başarıyla silindi!");
      fetchOwnerHouses(localStorage.getItem('email'));
    } catch (err) {
      setToast(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    router.push("/login");
  };

  const filteredHouses = houses.filter(house => {
    return (
      (!filter.city || (house.city && house.city.toLowerCase().includes(filter.city.toLowerCase()))) &&
      (!filter.status || (filter.status === "active" ? house.status === "active" : house.status !== "active")) &&
      (!filter.minPrice || house.price >= parseInt(filter.minPrice)) &&
      (!filter.maxPrice || house.price <= parseInt(filter.maxPrice))
    );
  });

  // Grafik için aylık veri hazırla
  const getMonthlyStats = (items, dateField, valueField) => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
    const stats = months.map((m) => {
      const filtered = items.filter((item) => {
        const d = new Date(item[dateField]);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === m;
      });
      return valueField
        ? filtered.reduce((sum, item) => sum + (item[valueField] || 0), 0)
        : filtered.length;
    });
    return { months, stats };
  };

  const resvStats = getMonthlyStats(reservations, "startDate", null);
  const payStats = getMonthlyStats(payments, "paymentDate", "amount");

  const barData = {
    labels: resvStats.months,
    datasets: [
      {
        label: "Rezervasyon",
        data: resvStats.stats,
        backgroundColor: "#3b82f6",
      },
      {
        label: "Gelir (₺)",
        data: payStats.stats,
        backgroundColor: "#f59e42",
      },
    ],
  };
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Son 6 Ay Rezervasyon ve Gelir" },
    },
  };

  const handleReviewResponse = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:5254/api/reviews/${reviewId}/response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: reviewResponse })
      });
      if (response.ok) {
        fetchOwnerStats(localStorage.getItem('email'));
        setShowReviewModal(false);
        setReviewResponse("");
      } else {
        setToast('Cevap kaydedilemedi!');
      }
    } catch (err) {
      setToast('Sunucu hatası!');
    }
  };

  const handleFavorite = async (houseId, isFav) => {
    if (!userId) return;
    if (isFav) {
      await fetch(`http://localhost:5254/api/favorites?userId=${userId}&houseId=${houseId}`, { method: "DELETE" });
    } else {
      await fetch("http://localhost:5254/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserID: userId, HouseID: houseId })
      });
    }
    // Favoriler listesini güncelle
    fetch(`http://localhost:5254/api/favorites/${userId}`)
      .then(res => res.json())
      .then(setFavorites);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-white/90 shadow flex items-center justify-between px-8 py-4 border-b border-blue-100">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-extrabold text-[#260B01] tracking-tight">MyTinyHouse</span>
          <button onClick={() => router.push("/owner2/dashboard")} className="text-blue-700 font-bold px-3 py-1 rounded hover:bg-blue-100">Evlerim</button>
          <button onClick={() => router.push("/owner2/add-house")} className="text-blue-700 font-bold px-3 py-1 rounded hover:bg-blue-100">Yeni Ev Ekle</button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-black font-semibold">{localStorage.getItem("email")}</span>
          <button onClick={() => router.push('/login')} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition-all">Giriş Yap</button>
          <button onClick={() => router.push('/signup')} className="bg-purple-500 text-white font-bold px-4 py-2 rounded-xl shadow hover:bg-purple-700 transition-all">Kaydol</button>
          <button onClick={handleLogout} className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bold px-4 py-2 rounded-xl shadow hover:from-red-600 hover:to-red-800 transition-all">Çıkış Yap</button>
        </div>
      </div>
      {/* Filtre Alanı */}
      <div className="max-w-7xl mx-auto mt-8 mb-6 px-4">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/90 rounded-xl shadow p-6 border border-blue-100" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="block text-sm font-bold text-black mb-2">Şehir</label>
            <input type="text" value={filter.city} onChange={e => setFilter(f => ({ ...f, city: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-black" placeholder="Şehir ara..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-2">Durum</label>
            <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-black">
              <option value="">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-2">Min. Fiyat</label>
            <input type="number" value={filter.minPrice} onChange={e => setFilter(f => ({ ...f, minPrice: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-black" placeholder="Min. fiyat" />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-2">Max. Fiyat</label>
            <input type="number" value={filter.maxPrice} onChange={e => setFilter(f => ({ ...f, maxPrice: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-black" placeholder="Max. fiyat" />
          </div>
        </form>
      </div>
      {/* Toast Bildirim */}
      <Toast message={toast} onClose={() => setToast("")} />
      {/* Özet Kutuları */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-8 mb-6 px-4">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <span className="text-2xl font-bold text-blue-700">{houses.length}</span>
          <span className="text-sm text-black mt-1">Toplam İlan</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <span className="text-2xl font-bold text-green-700">{reservations.length}</span>
          <span className="text-sm text-black mt-1">Toplam Rezervasyon</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <span className="text-2xl font-bold text-yellow-700">{payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString("tr-TR")}</span>
          <span className="text-sm text-black mt-1">Toplam Gelir (₺)</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <span className="text-2xl font-bold text-purple-700">{reviews.length}</span>
          <span className="text-sm text-black mt-1">Toplam Yorum</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <span className="text-2xl font-bold text-pink-700">{(reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2) : "-")}</span>
          <span className="text-sm text-black mt-1">Ortalama Puan</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <span className="text-2xl font-bold text-gray-700">{reservations.filter(r => r.status === "active").length}</span>
          <span className="text-sm text-black mt-1">Aktif Rezervasyon</span>
        </div>
      </div>
      {/* Grafik Alanı */}
      <div className="max-w-7xl mx-auto mb-8 px-4">
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
          <Bar data={barData} options={barOptions} height={80} />
        </div>
      </div>
      {/* Son Yorumlar Tablosu */}
      <div className="max-w-7xl mx-auto mb-8 px-4">
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
          <h3 className="text-lg font-bold mb-4 text-black">Son Yorumlar</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Puan</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Yorum</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Kullanıcı</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Cevap</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {reviews.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-2 text-yellow-600 font-bold">{r.rating}</td>
                    <td className="px-4 py-2 text-black">{r.comment}</td>
                    <td className="px-4 py-2 text-gray-700">{r.tenantEmail || r.userEmail || "-"}</td>
                    <td className="px-4 py-2 text-black">{r.response || '-'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => {
                          setSelectedReview(r);
                          setReviewResponse(r.response || "");
                          setShowReviewModal(true);
                        }}
                        className="text-indigo-700 hover:text-indigo-900 font-bold"
                      >
                        {r.response ? 'Cevabı Düzenle' : 'Cevap Yaz'}
                      </button>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-2 text-gray-400">Yorum yok</td></tr>
                )}
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
                  <span className="font-bold">Kullanıcı:</span> {selectedReview.tenantEmail || selectedReview.userEmail || "-"}
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
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors ml-2"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Son Rezervasyonlar Tablosu */}
      <div className="max-w-7xl mx-auto mb-8 px-4">
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
          <h3 className="text-lg font-bold mb-4 text-black">Son Rezervasyonlar</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Ev</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Başlangıç</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Bitiş</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Misafir</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Durum</th>
                </tr>
              </thead>
              <tbody>
                {reservations.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-2 text-black">{r.houseTitle || r.houseName || '-'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.endDate ? new Date(r.endDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.tenantEmail || r.userEmail || '-'}</td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      <span className={`px-2 py-1 rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : r.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-2 text-gray-400">Rezervasyon yok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Son Ödemeler Tablosu */}
      <div className="max-w-7xl mx-auto mb-8 px-4">
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
          <h3 className="text-lg font-bold mb-4 text-black">Son Ödemeler</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Ev</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tutar (₺)</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tarih</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Yöntem</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Durum</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((p, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-2 text-black">{p.houseTitle || '-'}</td>
                    <td className="px-4 py-2 text-green-700 font-bold">{p.amount?.toLocaleString('tr-TR')}</td>
                    <td className="px-4 py-2 text-gray-700">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2 text-gray-700">{p.paymentMethod || '-'}</td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      <span className={`px-2 py-1 rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-2 text-gray-400">Ödeme yok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Ev Kartları */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pb-12">
        {filteredHouses.map((house, i) => {
          const featuresArray = house.features
            ? (typeof house.features === "string"
                ? house.features.split(",").map(f => f.trim()).filter(f => f)
                : Array.isArray(house.features)
                  ? house.features
                  : [])
            : [];
          return (
            <div key={house.id || house.houseID || i} className="bg-white/90 rounded-2xl shadow-xl overflow-hidden border border-blue-100 flex flex-col hover:shadow-2xl transition-all group relative">
              {/* Durum etiketi */}
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${house.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{house.status === 'active' ? 'Aktif' : 'Pasif'}</span>
              {/* İsim ve Fiyat */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-blue-700">{house.houseTitle || house.houseName || '-'}</h3>
                <p className="text-sm text-black mt-1">Fiyat: {house.price?.toLocaleString('tr-TR')} ₺</p>
              </div>
              {/* İşlemler */}
              <div className="p-4 border-t border-blue-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setShowReviewModal(true);
                  }}
                  className="text-indigo-700 hover:text-indigo-900 font-bold"
                >
                  Yorum
                </button>
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setShowReviewModal(true);
                  }}
                  className="text-indigo-700 hover:text-indigo-900 font-bold"
                >
                  Ödeme
                </button>
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setShowReviewModal(true);
                  }}
                  className="text-indigo-700 hover:text-indigo-900 font-bold"
                >
                  Rezervasyon
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Popüler Evler */}
      <div className="max-w-7xl mx-auto mb-8 px-4">
        <h3 className="text-lg font-bold mb-4 text-black">Popüler Evler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularHouses && popularHouses.length > 0 ? (
            popularHouses.map((house) => (
              <div key={house.HouseID} className="bg-white rounded-xl shadow p-4 border border-blue-100">
                <img 
                  src={house.CoverImageUrl ? `http://localhost:5254${house.CoverImageUrl}` : "/default-house.jpg"} 
                  alt={house.Title} 
                  className="w-full h-32 object-cover rounded" 
                />
                <h4 className="font-bold mt-2">{house.Title}</h4>
                <p className="text-gray-600">{house.City}, {house.Country}</p>
                <p className="text-yellow-600 font-bold">★ {house.Rating?.toFixed(1) || "Henüz değerlendirilmemiş"}</p>
                <p className="text-blue-700 font-bold">{house.PricePerNight?.toLocaleString('tr-TR')} TL/gece</p>
                <button 
                  onClick={() => handleFavorite(house.HouseID, favorites.some(f => f.HouseID === house.HouseID))} 
                  className="mt-2 w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {favorites.some(f => f.HouseID === house.HouseID) ? "❤️ Favori" : "🤍 Favorilere Ekle"}
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500">Henüz popüler ev bulunmuyor.</div>
          )}
        </div>
      </div>
    </div>
  );
}