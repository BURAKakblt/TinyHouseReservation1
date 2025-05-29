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

  useEffect(() => {
    const email = localStorage.getItem("email");
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
                </tr>
              </thead>
              <tbody>
                {reviews.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-2 text-yellow-600 font-bold">{r.rating}</td>
                    <td className="px-4 py-2 text-black">{r.comment}</td>
                    <td className="px-4 py-2 text-gray-700">{r.tenantEmail || r.userEmail || "-"}</td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-2 text-gray-400">Yorum yok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
        {filteredHouses.map((house, i) => (
          <div key={house.id || house.houseID || i} className="bg-white/90 rounded-2xl shadow-xl overflow-hidden border border-blue-100 flex flex-col hover:shadow-2xl transition-all group relative">
            {/* Durum etiketi */}
            <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${house.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{house.status === 'active' ? 'Aktif' : 'Pasif'}</span>
            <img
              src={house.coverImageUrl ? `http://localhost:5254${house.coverImageUrl}` : "/default-house.jpg"}
              alt={house.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-bold text-xl mb-1 text-black truncate">{house.title}</h3>
              <p className="text-gray-600 mb-2 text-base">{house.city}, {house.country}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-700 font-bold text-lg">{house.price} TL/gece</span>
                <div className="flex items-center">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="ml-1 text-black font-semibold">{house.rating || "Henüz değerlendirilmemiş"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {house.features && house.features.slice(0, 3).map((feature, i) => (
                  <span key={i} className="bg-gray-100 text-black px-3 py-1 rounded-full text-xs">{feature}</span>
                ))}
                {house.features && house.features.length > 3 && (
                  <span className="bg-gray-100 text-black px-3 py-1 rounded-full text-xs">+{house.features.length - 3}</span>
                )}
              </div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => router.push(`/owner2/edit-house/${house.id || house.houseID}`)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-xl font-bold shadow hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => { setShowDeleteModal(true); setDeleteId(house.id || house.houseID); }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-700 text-white py-2 rounded-xl font-bold shadow hover:from-red-600 hover:to-red-800 transition-all"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <DeleteModal
        open={showDeleteModal}
        onConfirm={() => handleDeleteHouse(deleteId)}
        onCancel={() => { setShowDeleteModal(false); setDeleteId(null); }}
        deleting={deleting}
      />
      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease; }
      `}</style>
    </div>
  );
}

function DeleteModal({ open, onConfirm, onCancel, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-red-200 animate-fade-in">
        <h2 className="text-xl font-bold text-red-700 mb-4">Evi Sil</h2>
        <p className="mb-6 text-black">Bu evi silmek istediğinize emin misiniz?</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className={`flex-1 py-2 rounded-lg font-bold shadow bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-all duration-200 disabled:opacity-50 ${deleting ? 'cursor-not-allowed' : ''}`}
          >
            {deleting ? <span className="animate-pulse">Siliniyor...</span> : "Evet, Sil"}
          </button>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg font-bold shadow bg-gray-200 text-black hover:bg-gray-300 transition-all duration-200"
          >
            Vazgeç
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease;
        }
      `}</style>
    </div>
  );
} 