"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useToast from "../../../components/useToast";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [listings, setListings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [financialReport, setFinancialReport] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const showToast = useToast();

  useEffect(() => {
    fetchUsers();
    fetchReservations();
    fetchListings();
    fetchPayments();
    fetchFinancialReport();
    fetchStatistics();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5254/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Kullanıcılar yüklenemedi");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch("http://localhost:5254/api/admin/reservations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Rezervasyonlar yüklenemedi");
      }
      const data = await response.json();
      setReservations(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchListings = async () => {
    try {
      const response = await fetch("http://localhost:5254/api/admin/listings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("İlanlar yüklenemedi");
      }
      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch("http://localhost:5254/api/admin/payments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Ödemeler yüklenemedi");
      }
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchFinancialReport = async () => {
    try {
      const response = await fetch("http://localhost:5254/api/admin/financial-report", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Mali rapor yüklenemedi");
      }
      const data = await response.json();
      setFinancialReport(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch("http://localhost:5254/api/admin/statistics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("İstatistikler yüklenemedi");
      }
      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch("http://localhost:5254/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ ...newUser, IsActive: true }),
      });
      if (!response.ok) {
        throw new Error("Kullanıcı eklenemedi");
      }
      fetchUsers();
      setNewUser({ name: "", email: "", role: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:5254/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          Name: editingUser.name,
          Email: editingUser.email,
          Role: editingUser.role,
          IsActive: editingUser.IsActive !== undefined ? editingUser.IsActive : true
        }),
      });
      if (!response.ok) {
        throw new Error("Kullanıcı güncellenemedi");
      }
      fetchUsers();
      setEditingUser(null);
      setSuccessMessage("Kullanıcı başarıyla güncellendi.");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5254/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) {
        showToast({ message: "Kullanıcı silinemedi!", type: "error" });
        throw new Error("Kullanıcı silinemedi");
      }
      fetchUsers();
      showToast({ message: "Kullanıcı başarıyla silindi!", type: "success" });
      setSuccessMessage("Kullanıcı başarıyla silindi.");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setError(err.message);
      showToast({ message: err.message || "Kullanıcı silinemedi!", type: "error" });
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      const response = await fetch(`http://localhost:5254/api/admin/reservations/${id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Rezervasyon iptal edilemedi");
      }
      fetchReservations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteListing = async (id) => {
    try {
      const response = await fetch(`http://localhost:5254/api/admin/listings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) {
        throw new Error("İlan silinemedi");
      }
      fetchListings();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditListing = async (id) => {
    // İlan düzenleme işlevi burada eklenebilir
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/");
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    try {
      const user = users.find(u => (u.id || u.UserID) === id);
      const response = await fetch(`http://localhost:5254/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          Name: user.name,
          Email: user.email,
          Role: user.role,
          IsActive: !currentStatus
        }),
      });
      if (!response.ok) {
        throw new Error("Kullanıcı durumu güncellenemedi");
      }
      fetchUsers();
      showToast({ message: `Kullanıcı ${!currentStatus ? "aktif" : "pasif"} yapıldı!`, type: "success" });
    } catch (err) {
      setError(err.message);
      showToast({ message: err.message || "Kullanıcı durumu güncellenemedi!", type: "error" });
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error && !statistics && !financialReport) {
    return <div>Hata: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bold px-4 py-2 rounded-xl shadow hover:from-red-600 hover:to-red-800 transition-all"
        >
          Çıkış Yap
        </button>
      </div>
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 text-center tracking-tight">Admin Dashboard</h1>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Kullanıcılar</h2>
        <input
          type="text"
          placeholder="Kullanıcı Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-900"
        />
        {successMessage && (
          <div className="text-green-600 text-center font-semibold mb-4">{successMessage}</div>
        )}
        <ul className="space-y-4">
          {filteredUsers.map((user, idx) => {
            const isEditing = editingUser && (editingUser.id || editingUser.UserID) === (user.id || user.UserID);
            return (
              <li key={user.id || user.UserID || user.email || idx} className={`border-b pb-3 flex flex-col md:flex-row md:items-center md:justify-between ${isEditing ? 'bg-indigo-50 border-indigo-400 rounded-lg shadow-md' : ''}`}>
                {isEditing ? (
                  <div className="flex flex-col md:flex-row md:items-center w-full gap-2">
                    <input
                      type="text"
                      value={editingUser.name ?? ""}
                      onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="p-2 border border-indigo-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ad"
                    />
                    <input
                      type="email"
                      value={editingUser.email ?? ""}
                      onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="p-2 border border-indigo-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={editingUser.role ?? ""}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="p-2 border border-indigo-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
                      placeholder="Rol"
                    />
                    <button onClick={() => handleEditUser(user.id || user.UserID)} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-5 py-2 rounded-lg font-semibold shadow transition">Kaydet</button>
                    <button onClick={() => setEditingUser(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold shadow transition">İptal</button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center w-full justify-between">
                    <div>
                      <p className="text-gray-900 font-semibold"><strong>Ad:</strong> {user.name}</p>
                      <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
                      <p className="text-gray-700"><strong>Rol:</strong> {user.role}</p>
                      <p className="text-gray-700">
                        <strong>Durum:</strong>{" "}
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.IsActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {user.IsActive ? "Aktif" : "Pasif"}
                        </span>
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0 flex gap-2">
                      <button onClick={() => setEditingUser(user)} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow transition">Düzenle</button>
                      <button onClick={() => handleDeleteUser(user.id || user.UserID)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow transition">Sil</button>
                      <button onClick={() => handleToggleUserStatus(user.id || user.UserID, user.IsActive)} className={`${user.IsActive ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"} text-white px-4 py-2 rounded-lg font-medium shadow transition`}>
                        {user.IsActive ? "Pasif Yap" : "Aktif Yap"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2 text-gray-800">Yeni Kullanıcı Ekle</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Ad"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg text-gray-900"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg text-gray-900"
            />
            <input
              type="text"
              placeholder="Rol"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg text-gray-900"
            />
            <button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold">Ekle</button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Rezervasyonlar</h2>
        <ul className="space-y-4">
          {reservations.map((reservation, idx) => (
            <li key={reservation.id || reservation.ReservationID || idx} className="border-b pb-3 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-gray-900 font-semibold"><strong>Başlangıç Tarihi:</strong> {new Date(reservation.startDate).toLocaleDateString()}</p>
                <p className="text-gray-700"><strong>Bitiş Tarihi:</strong> {new Date(reservation.endDate).toLocaleDateString()}</p>
                <p className="text-gray-700"><strong>Ödeme Durumu:</strong> {reservation.paymentStatus}</p>
                <p className="text-gray-700"><strong>Kullanıcı:</strong> {reservation.userName}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <button onClick={() => handleCancelReservation(reservation.id || reservation.ReservationID)} className="text-red-600 hover:underline font-medium">İptal Et</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">İlanlar</h2>
        <ul className="space-y-4">
          {listings.map((listing, idx) => (
            <li key={listing.id || listing.ListingID || idx} className="border-b pb-3 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-gray-900 font-semibold"><strong>Ev Sahibi:</strong> {listing.ownerName}</p>
                <p className="text-gray-700"><strong>Fiyat:</strong> {listing.price}</p>
                <p className="text-gray-700"><strong>Konum:</strong> {listing.location}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <button onClick={() => handleEditListing(listing.id || listing.ListingID)} className="text-indigo-600 hover:underline font-medium">Düzenle</button>
                <button onClick={() => handleDeleteListing(listing.id || listing.ListingID)} className="text-red-600 hover:underline font-medium ml-4">Sil</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Ödemeler</h2>
        <ul className="space-y-4">
          {payments.map((payment, idx) => (
            <li key={payment.PaymentID || idx} className="border-b pb-3 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-gray-900 font-semibold"><strong>Kullanıcı:</strong> {payment.UserName}</p>
                <p className="text-gray-700"><strong>Ev:</strong> {payment.HouseTitle}</p>
                <p className="text-gray-700"><strong>Tutar:</strong> {payment.Amount} ₺</p>
                <p className="text-gray-700"><strong>Yöntem:</strong> {payment.PaymentMethod}</p>
                <p className="text-gray-700"><strong>Durum:</strong> {payment.Status}</p>
                <p className="text-gray-700"><strong>Tarih:</strong> {new Date(payment.PaymentDate).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">İstatistikler ve Raporlama</h2>
        {statistics && statistics.UserStats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-indigo-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-indigo-700">{statistics.UserStats.TotalUsers}</p>
                <p className="text-gray-700 font-semibold mt-2">Kullanıcı Sayısı</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-indigo-700">{statistics.UserStats.ActiveUsers}</p>
                <p className="text-gray-700 font-semibold mt-2">Aktif Kullanıcı</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-indigo-700">{statistics.UserStats.NewUsers}</p>
                <p className="text-gray-700 font-semibold mt-2">Yeni Üye (30 gün)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-green-700">{statistics.TotalReservations}</p>
                <p className="text-gray-700 font-semibold mt-2">Toplam Rezervasyon</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-green-700">{statistics.TotalPayments}</p>
                <p className="text-gray-700 font-semibold mt-2">Toplam Ödeme</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-green-700">{statistics.TotalReviews}</p>
                <p className="text-gray-700 font-semibold mt-2">Toplam Yorum</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Rezervasyon Trendleri (Son 6 Ay)</h3>
              <div className="flex items-end space-x-4 h-40">
                {statistics.ReservationTrends && statistics.ReservationTrends.map((trend, idx) => (
                  <div key={trend.Month || idx} className="flex flex-col items-center">
                    <div style={{height: `${trend.Count * 10}px`}} className="w-10 bg-indigo-400 rounded-t shadow-md"></div>
                    <span className="text-xs mt-2 text-gray-700 font-medium">{trend.Month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {financialReport && (
          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">Mali Rapor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-blue-700">{financialReport.totalIncome}</p>
                <p className="text-gray-700 font-semibold mt-2">Toplam Gelir</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-blue-700">{financialReport.totalExpense}</p>
                <p className="text-gray-700 font-semibold mt-2">Toplam Gider</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <p className="text-4xl font-extrabold text-blue-700">{financialReport.netIncome}</p>
                <p className="text-gray-700 font-semibold mt-2">Net Gelir</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 