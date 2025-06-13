"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useToast from "../../../components/useToast";
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
  const [newUser, setNewUser] = useState({ name: "", lastName: "", email: "", role: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSection, setOpenSection] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState("");
  const [reservationError, setReservationError] = useState("");
  const [recentActivities, setRecentActivities] = useState(null);
  const router = useRouter();
  const showToast = useToast();

  useEffect(() => {
    fetchUsers();
    fetchReservations();
    fetchListings();
    fetchPayments();
    fetchFinancialReport();
    fetchStatistics();
    fetchRecentActivities();
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

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch("http://localhost:5254/api/admin/recent-activities", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setRecentActivities(data);
    } catch {}
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
      setNewUser({ name: "", lastName: "", email: "", role: "" });
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
          LastName: editingUser.lastName,
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
        setReservationError("Rezervasyon iptal edilemedi.");
        setTimeout(() => setReservationError(""), 2000);
        throw new Error("Rezervasyon iptal edilemedi");
      }
      fetchReservations();
      setReservationSuccess("Rezervasyon başarıyla iptal edildi.");
      setTimeout(() => setReservationSuccess(""), 2000);
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
    try {
      const response = await fetch(`http://localhost:5254/api/houses/${id}`);
      if (!response.ok) {
        throw new Error('İlan bilgileri alınamadı');
      }
      const house = await response.json();
      router.push(`/admin/edit-house/${id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('İlan düzenleme sayfasına yönlendirilirken bir hata oluştu.');
    }
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
          LastName: user.lastName,
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
    (user.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kullanıcıları role göre ayır
  const tenants = filteredUsers.filter(user => (user.role || '').toLowerCase() === 'tenant');
  const owners = filteredUsers.filter(user => (user.role || '').toLowerCase() === 'owner');
  const admins = filteredUsers.filter(user => (user.role || '').toLowerCase() === 'admin');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Kullanıcı kartı render fonksiyonu (artık içeride)
  function renderUserItem(user, idx) {
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
              type="text"
              value={editingUser.lastName ?? ""}
              onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })}
              className="p-2 border border-indigo-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
              placeholder="Soyad"
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
              <p className="text-gray-900 font-semibold"><strong>Soyad:</strong> {user.lastName}</p>
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
  }

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

      {/* Genel Sistem Özeti */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 shadow flex flex-col items-center justify-center">
            <div className="text-4xl font-extrabold text-white mb-2">{statistics.userStats.activeUsers}</div>
            <div className="text-lg font-semibold text-white">Aktif Kullanıcı</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 shadow flex flex-col items-center justify-center">
            <div className="text-4xl font-extrabold text-white mb-2">{statistics.totalReservations}</div>
            <div className="text-lg font-semibold text-white">Toplam Rezervasyon</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 shadow flex flex-col items-center justify-center">
            <div className="text-4xl font-extrabold text-white mb-2">{statistics.totalPayments}</div>
            <div className="text-lg font-semibold text-white">Toplam Ödeme</div>
          </div>
        </div>
      )}

      {/* Son Aktiviteler */}
      {recentActivities && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 shadow flex flex-col items-center border border-indigo-100">
            <div className="text-xs uppercase text-indigo-500 font-bold mb-1">Son Kullanıcı</div>
            {recentActivities.lastUser ? (
              <>
                <div className="text-lg font-bold text-indigo-700">{recentActivities.lastUser.Name} {recentActivities.lastUser.LastName}</div>
                <div className="text-gray-700 text-sm">{recentActivities.lastUser.Email}</div>
                <div className="text-gray-400 text-xs mt-1">{recentActivities.lastUser.CreatedAt ? new Date(recentActivities.lastUser.CreatedAt).toLocaleString('tr-TR') : '-'}</div>
              </>
            ) : <div className="text-gray-400">Kayıt yok</div>}
          </div>
          <div className="bg-white rounded-xl p-5 shadow flex flex-col items-center border border-blue-100">
            <div className="text-xs uppercase text-blue-500 font-bold mb-1">Son Rezervasyon</div>
            {recentActivities.lastReservation ? (
              <>
                <div className="text-lg font-bold text-blue-700">Rez. #{recentActivities.lastReservation.ReservationID}</div>
                <div className="text-gray-700 text-sm">{recentActivities.lastReservation.TotalPrice} ₺</div>
                <div className="text-gray-400 text-xs mt-1">{recentActivities.lastReservation.CreatedAt ? new Date(recentActivities.lastReservation.CreatedAt).toLocaleString('tr-TR') : '-'}</div>
              </>
            ) : <div className="text-gray-400">Kayıt yok</div>}
          </div>
          <div className="bg-white rounded-xl p-5 shadow flex flex-col items-center border border-green-100">
            <div className="text-xs uppercase text-green-500 font-bold mb-1">Son Ödeme</div>
            {recentActivities.lastPayment ? (
              <>
                <div className="text-lg font-bold text-green-700">{recentActivities.lastPayment.Amount} ₺</div>
                <div className="text-gray-700 text-sm">{recentActivities.lastPayment.PaymentMethod}</div>
                <div className="text-gray-400 text-xs mt-1">{recentActivities.lastPayment.PaymentDate ? new Date(recentActivities.lastPayment.PaymentDate).toLocaleString('tr-TR') : '-'}</div>
              </>
            ) : <div className="text-gray-400">Kayıt yok</div>}
          </div>
        </div>
      )}

      {/* Kullanıcılar Accordion */}
      <div className="bg-white rounded-xl shadow-lg mb-4 border border-gray-200">
        <button
          className="w-full text-left p-6 text-2xl font-bold text-gray-800 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('users')}
        >
          Kullanıcılar
          <span>{openSection === 'users' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'users' && (
          <div className="p-6 pt-0">
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
            {/* Kiracılar */}
            <h3 className="text-xl font-bold mb-2 text-indigo-700">Kiracılar</h3>
            <ul className="space-y-4 mb-6">
              {tenants.length === 0 && <li className="text-gray-500">Kayıtlı kiracı yok.</li>}
              {tenants.map((user, idx) => renderUserItem(user, idx))}
            </ul>
            {/* İlan Sahipleri */}
            <h3 className="text-xl font-bold mb-2 text-yellow-700">İlan Sahipleri</h3>
            <ul className="space-y-4 mb-6">
              {owners.length === 0 && <li className="text-gray-500">Kayıtlı ilan sahibi yok.</li>}
              {owners.map((user, idx) => renderUserItem(user, idx))}
            </ul>
            {/* Adminler */}
            <h3 className="text-xl font-bold mb-2 text-red-700">Adminler</h3>
            <ul className="space-y-4 mb-6">
              {admins.length === 0 && <li className="text-gray-500">Kayıtlı admin yok.</li>}
              {admins.map((user, idx) => renderUserItem(user, idx))}
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
                  type="text"
                  placeholder="Soyad"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
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
                  placeholder="Rol (tenant/owner/admin)"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="p-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold">Ekle</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rezervasyonlar Accordion */}
      <div className="bg-white rounded-xl shadow-lg mb-4 border border-gray-200">
        <button
          className="w-full text-left p-6 text-2xl font-bold text-gray-800 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('reservations')}
        >
          Rezervasyonlar
          <span>{openSection === 'reservations' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'reservations' && (
          <div className="p-6 pt-0">
            {reservationSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-center font-semibold">
                {reservationSuccess}
              </div>
            )}
            {reservationError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center font-semibold">
                {reservationError}
              </div>
            )}
            <ul className="space-y-4">
              {reservations.map((reservation, idx) => (
                <li key={reservation.id || idx} className="border-b pb-3 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold"><strong>Başlangıç Tarihi:</strong> {reservation.checkIn ? new Date(reservation.checkIn).toLocaleDateString('tr-TR') : '-'}</p>
                    <p className="text-gray-700"><strong>Bitiş Tarihi:</strong> {reservation.checkOut ? new Date(reservation.checkOut).toLocaleDateString('tr-TR') : '-'}</p>
                    <p className="text-gray-700"><strong>Rezervasyon Durumu:</strong> {reservation.status || '-'}</p>
                    <p className="text-gray-700"><strong>Kullanıcı:</strong> {reservation.tenantName} {reservation.tenantLastName} ({reservation.tenant})</p>
                    <p className="text-gray-700"><strong>Ödeme Durumu:</strong> {reservation.paymentStatus || '-'}</p>
                    {reservation.paymentStatus && (
                      <p className="text-gray-700"><strong>Ödenen Tutar:</strong> {reservation.totalPrice} ₺</p>
                    )}
                  </div>
                  <div className="mt-2 md:mt-0">
                    <button onClick={() => handleCancelReservation(reservation.id)} className="text-red-600 hover:underline font-medium">İptal Et</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* İlanlar Accordion */}
      <div className="bg-white rounded-xl shadow-lg mb-4 border border-gray-200">
        <button
          className="w-full text-left p-6 text-2xl font-bold text-gray-800 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('listings')}
        >
          İlanlar
          <span>{openSection === 'listings' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'listings' && (
          <div className="p-6 pt-0">
            <h3 className="text-xl font-bold mb-2 text-indigo-700">İlanlar</h3>
            <ul className="space-y-4 mb-6">
              {listings.length === 0 && <li className="text-gray-500">Kayıtlı ilan yok.</li>}
              {listings.map((listing, idx) => (
                <li key={listing.id || idx} className="border-b pb-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-gray-900 font-semibold"><strong>Başlık:</strong> {listing.title}</p>
                      <p className="text-gray-700"><strong>Şehir:</strong> {listing.city}</p>
                      <p className="text-gray-700"><strong>Ülke:</strong> {listing.country}</p>
                      <p className="text-gray-700"><strong>Oluşturulma:</strong> {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('tr-TR') : '-'}</p>
                      <p className="text-gray-700"><strong>Son Güncelleme:</strong> {listing.updatedAt ? new Date(listing.updatedAt).toLocaleDateString('tr-TR') : 'Güncellenmedi'}</p>
                    </div>
                    <div className="mt-2 md:mt-0 flex gap-2">
                      <button onClick={() => handleEditListing(listing.id)} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow transition">Düzenle</button>
                      <button onClick={() => handleDeleteListing(listing.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow transition">Sil</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Ödemeler Accordion */}
      <div className="bg-white rounded-xl shadow-lg mb-4 border border-gray-200">
        <button
          className="w-full text-left p-6 text-2xl font-bold text-gray-800 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('payments')}
        >
          Ödemeler
          <span>{openSection === 'payments' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'payments' && (
          <div className="p-6 pt-0">
            <ul className="space-y-4">
              {payments.map((payment, idx) => (
                <li key={payment.paymentId || idx} className="border-b pb-3 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold"><strong>Kullanıcı:</strong> {payment.userName} {payment.userLastName} ({payment.userEmail})</p>
                    <p className="text-gray-700"><strong>Ev:</strong> {payment.houseTitle}</p>
                    <p className="text-gray-700"><strong>Tutar:</strong> {payment.amount} ₺</p>
                    <p className="text-gray-700"><strong>Yöntem:</strong> {payment.paymentMethod}</p>
                    <p className="text-gray-700"><strong>Durum:</strong> {payment.status}</p>
                    <p className="text-gray-700"><strong>Tarih:</strong> {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString('tr-TR') : '-'}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* İstatistikler ve Raporlama Accordion */}
      <div className="bg-white rounded-xl shadow-lg mb-4 border border-gray-200">
        <button
          className="w-full text-left p-6 text-2xl font-bold text-gray-800 flex justify-between items-center focus:outline-none"
          onClick={() => toggleSection('stats')}
        >
          İstatistikler ve Raporlama
          <span>{openSection === 'stats' ? '▲' : '▼'}</span>
        </button>
        {openSection === 'stats' && statistics && (
          <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-indigo-700">Kullanıcı İstatistikleri</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 shadow">
                  <div className="text-3xl font-extrabold text-indigo-700">{statistics.userStats.totalUsers}</div>
                  <div className="text-lg font-semibold text-indigo-700">Toplam Kullanıcı</div>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-lg p-4 shadow">
                  <div className="text-3xl font-extrabold text-green-700">{statistics.userStats.activeUsers}</div>
                  <div className="text-lg font-semibold text-green-700">Aktif Kullanıcı</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 shadow">
                  <div className="text-3xl font-extrabold text-yellow-700">{statistics.userStats.newUsers}</div>
                  <div className="text-lg font-semibold text-yellow-700">Son 30 Gün Yeni Üye</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-purple-700">Sistem Genel Durumu</h3>
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-4 shadow">
                  <div className="text-3xl font-extrabold text-blue-700">{statistics.totalReservations}</div>
                  <div className="text-lg font-semibold text-blue-700">Toplam Rezervasyon</div>
                </div>
                <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-lg p-4 shadow">
                  <div className="text-3xl font-extrabold text-pink-700">{statistics.totalPayments}</div>
                  <div className="text-lg font-semibold text-pink-700">Toplam Ödeme</div>
                </div>
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4 shadow">
                  <div className="text-3xl font-extrabold text-gray-700">{statistics.totalReviews}</div>
                  <div className="text-lg font-semibold text-gray-700">Toplam Yorum</div>
                </div>
              </div>
              <h4 className="text-lg font-bold mb-2 text-indigo-800">Aylık Rezervasyon Trendi</h4>
              <Bar
                data={{
                  labels: statistics.reservationTrends.map(t => t.Month),
                  datasets: [
                    {
                      label: "Rezervasyon Sayısı",
                      data: statistics.reservationTrends.map(t => t.Count),
                      backgroundColor: "#6366f1",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
                height={200}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 