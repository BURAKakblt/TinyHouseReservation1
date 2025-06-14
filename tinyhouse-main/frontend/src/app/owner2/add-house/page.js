"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddHouse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [houseData, setHouseData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    houseType: "tiny-house",
    amenities: [],
    images: [],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [coverImage, setCoverImage] = useState(null);

  const handleCoverImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleInteriorImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const handleAmenityToggle = (amenity) => {
    setHouseData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("Title", houseData.title);
      formData.append("Description", houseData.description);
      formData.append("City", houseData.location);
      formData.append("Country", "Turkey");
      formData.append("Bedrooms", Number(houseData.bedrooms));
      formData.append("Bathrooms", Number(houseData.bathrooms));
      formData.append("PricePerNight", Number(houseData.price));
      formData.append("Rating", "5");
      formData.append("OwnerEmail", localStorage.getItem("email"));
      formData.append("HouseType", houseData.houseType);
      formData.append("MaxGuests", Number(houseData.maxGuests));
      if (coverImage) {
        formData.append("CoverImage", coverImage);
      }
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("InteriorImages", file);
        });
      }

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5254/api/houses", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        router.push("/owner2/dashboard");
      } else {
        let text = await response.text();
        alert(text);
      }
    } catch (error) {
      alert("İlan eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-6">Yeni Ev Ekle</h1>
          <button
            onClick={() => router.push('/owner2/dashboard')}
            className="bg-gradient-to-r from-blue-200 to-blue-400 text-blue-900 font-bold px-4 py-2 rounded-xl shadow hover:from-blue-300 hover:to-blue-500 transition-all"
          >
            Geri Dön
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ev Başlığı
                </label>
                <input
                  type="text"
                  value={houseData.title}
                  onChange={(e) => setHouseData({ ...houseData, title: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder-black"
                  style={{ color: '#000' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konum
                </label>
                <input
                  type="text"
                  value={houseData.location}
                  onChange={(e) => setHouseData({ ...houseData, location: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder-black"
                  style={{ color: '#000' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (TL/gece)
                </label>
                <input
                  type="number"
                  value={houseData.price}
                  onChange={(e) => setHouseData({ ...houseData, price: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder-black"
                  style={{ color: '#000' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ev Tipi
                </label>
                <select
                  value={houseData.houseType}
                  onChange={(e) => setHouseData({ ...houseData, houseType: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder-black"
                  style={{ color: '#000' }}
                >
                  <option value="tiny-house">Tiny House</option>
                  <option value="cabin">Kabin</option>
                  <option value="treehouse">Ağaç Evi</option>
                </select>
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={houseData.description}
                onChange={(e) => setHouseData({ ...houseData, description: e.target.value })}
                rows="4"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder-black"
                style={{ color: '#000' }}
                required
              />
            </div>

            {/* Resimler */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapak Görseli
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="w-full text-black placeholder-black"
                style={{ color: '#000' }}
              />
              {coverImage && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(coverImage)}
                    alt="Kapak Önizleme"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                İç Mekan Fotoğrafları (5 adet)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleInteriorImagesChange}
                className="w-full text-black placeholder-black"
                style={{ color: '#000' }}
              />
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Oda Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maksimum Misafir
                </label>
                <input
                  type="number"
                  min="1"
                  value={houseData.maxGuests}
                  onChange={(e) => setHouseData({ ...houseData, maxGuests: e.target.value === "" ? "" : parseInt(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder-black"
                  style={{ color: '#000' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yatak Odası Sayısı
                </label>
                <input
                  type="number"
                  min="1"
                  value={houseData.bedrooms}
                  onChange={(e) => setHouseData({ ...houseData, bedrooms: e.target.value === "" ? "" : parseInt(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder-black"
                  style={{ color: '#000' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banyo Sayısı
                </label>
                <input
                  type="number"
                  min="1"
                  value={houseData.bathrooms}
                  onChange={(e) => setHouseData({ ...houseData, bathrooms: e.target.value === "" ? "" : parseInt(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder-black"
                  style={{ color: '#000' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {loading ? "Ekleniyor..." : "Ev Ekle"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 