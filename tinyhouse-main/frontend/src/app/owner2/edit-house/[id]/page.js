"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditHouse({ params }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const houseId = resolvedParams.id;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    country: "",
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 0,
    rating: 5,
    status: "active",
    startDate: "",
    endDate: "",
    maxGuests: 2,
    houseType: "tiny-house",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [interiorImages, setInteriorImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      router.push("/login");
      return;
    }
    fetchHouseData();
  }, []);

  const fetchHouseData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5254/api/houses/${houseId}`
      );
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title,
          description: data.description,
          city: data.city,
          country: data.country,
          bedrooms: data.bedrooms || data.bedroomCount || 1,
          bathrooms: data.bathrooms || data.bathroomCount || 1,
          pricePerNight: data.pricePerNight || data.price || 0,
          rating: data.rating || 5,
          status: data.status || "active",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          maxGuests: data.maxGuests || 2,
          houseType: data.houseType || "tiny-house",
        });
      } else {
        setError("İlan bilgileri yüklenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("İlan bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCoverImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleInteriorImagesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setInteriorImages(files);
    }
  };

  const handleStatusChange = async () => {
    const newIsActive = formData.status !== "active";
    try {
      const response = await fetch(`http://localhost:5254/api/houses/${houseId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newIsActive })
      });
      if (response.ok) {
        setFormData((prev) => ({ ...prev, status: newIsActive ? "active" : "inactive" }));
        alert(`İlan durumu güncellendi: ${newIsActive ? "Aktif" : "Pasif"}`);
      } else {
        alert("Durum güncellenemedi!");
      }
    } catch (err) {
      alert("Durum güncellenemedi!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Title", formData.title);
      formDataToSend.append("Description", formData.description);
      formDataToSend.append("City", formData.city);
      formDataToSend.append("Country", formData.country);
      formDataToSend.append("BedroomCount", formData.bedrooms);
      formDataToSend.append("BathroomCount", formData.bathrooms);
      formDataToSend.append("PricePerNight", formData.pricePerNight);
      formDataToSend.append("Rating", formData.rating);
      if (coverImage) {
        formDataToSend.append("CoverImage", coverImage);
      }
      if (interiorImages.length > 0) {
        interiorImages.forEach((image) => {
          formDataToSend.append("InteriorImages", image);
        });
      }
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5254/api/houses/${houseId}`,
        {
          method: "PUT",
          body: formDataToSend,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (response.ok) {
        router.push("/owner2/dashboard");
      } else {
        const data = await response.json();
        setError(data.message || "İlan güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("İlan güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5254/api/houses/${houseId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        setShowDeleteModal(false);
        alert("İlan silindi!");
        router.push("/owner2/dashboard");
      } else {
        const data = await response.json();
        alert(data.message || "Silme işlemi başarısız oldu!");
      }
    } catch (err) {
      alert("Silme işlemi başarısız oldu!");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/90 shadow-2xl rounded-3xl p-8 border border-blue-100">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight drop-shadow">İlanı Düzenle</h1>
            <button onClick={() => router.push("/owner2/dashboard")} className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">Geri Dön</button>
          </div>
          {error && (
            <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">İlan Başlığı</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Şehir</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Ülke</label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} required className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Ev Tipi</label>
                <select name="houseType" value={formData.houseType} onChange={handleInputChange} className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all">
                  <option value="tiny-house">Tiny House</option>
                  <option value="cabin">Kabin</option>
                  <option value="treehouse">Ağaç Evi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Yatak Odası</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} required min="1" className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Banyo</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} required min="1" className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Gecelik Fiyat (₺)</label>
                <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleInputChange} required min="0" className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Puan (1-5)</label>
                <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} required min="1" max="5" step="0.1" className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Maksimum Misafir</label>
                <input type="number" name="maxGuests" value={formData.maxGuests} onChange={handleInputChange} required min="1" className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Başlangıç Tarihi</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Bitiş Tarihi</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Açıklama</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="4" className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black bg-white/80 px-4 py-2 transition-all" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Kapak Fotoğrafı (Değiştirmek için seçin)</label>
                <input type="file" accept="image/*" onChange={handleCoverImageChange} className="mt-1 block w-full text-black file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 file:font-semibold file:px-4 file:py-2 file:mr-4 file:transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">İç Mekan Fotoğrafları (Değiştirmek için seçin)</label>
                <input type="file" accept="image/*" multiple onChange={handleInteriorImagesChange} className="mt-1 block w-full text-black file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 file:font-semibold file:px-4 file:py-2 file:mr-4 file:transition-all" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <button
                type="button"
                onClick={handleStatusChange}
                className={`flex-1 py-3 rounded-xl font-bold shadow transition-all duration-200 
                  ${formData.status === 'active' 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'}`}
              >
                {formData.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className={`flex-1 py-3 rounded-xl font-bold shadow bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-all duration-200 disabled:opacity-50 ${deleting ? 'cursor-not-allowed' : ''}`}
              >
                Sil
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-bold shadow bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500 transition-all duration-200 disabled:opacity-50">
                {saving ? <span className="animate-pulse">Kaydediliyor...</span> : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <DeleteModal open={showDeleteModal} onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} deleting={deleting} />
    </div>
  );
}

function DeleteModal({ open, onConfirm, onCancel, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-red-200 animate-fade-in">
        <h2 className="text-xl font-bold text-red-700 mb-4">İlanı Sil</h2>
        <p className="mb-6 text-gray-700">Bu ilanı silmek istediğinize emin misiniz?</p>
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
            className="flex-1 py-2 rounded-lg font-bold shadow bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200"
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