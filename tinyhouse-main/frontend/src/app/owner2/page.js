"use client";

import React, { useEffect, useState } from "react";
import useToast from "../components/useToast";

export default function NewHouseForm() {
  const [email, setEmail] = useState("");
  const [houses, setHouses] = useState([]);
  const [newHouse, setNewHouse] = useState({
    title: "",
    city: "",
    country: "",
    bedroomCount: "",
    bathroomCount: "",
    pricePerNight: "",
    rating: "",
    description: "",
    coverImage: null,
    interiorImages: [],
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
      fetchHouses(storedEmail);
    } else {
      console.error("Email bulunamadı. Lütfen giriş yapın.");
      // İsteğe bağlı: Kullanıcıyı login sayfasına yönlendir
      // window.location.href = '/login';
    }
  }, []);

  // Evleri çek
  const fetchHouses = async (emailToFetch) => {
    if (!emailToFetch) {
      console.error("Email parametresi gerekli");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5254/api/houses/by-owner?email=${encodeURIComponent(emailToFetch)}`);
      console.log("Response status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("Sunucu hatası:", text);
        return;
      }

      const data = await res.json();
      setHouses(data || []);
    } catch (error) {
      console.error("API bağlantı hatası:", error);
    }
  };

  // Input değişikliği
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setNewHouse((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // Kapak görseli
  const handleCoverImageChange = (e) => {
    setNewHouse({ ...newHouse, coverImage: e.target.files[0] });
  };

  // İç görseller
  const handleInteriorImagesChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setNewHouse({ ...newHouse, interiorImages: files });
  };

  // DÜZENLE: Bilgileri forma doldur
  const handleEdit = (ev) => {
    setEditingId(ev.houseID);
    setNewHouse({
      title: ev.title || "",
      city: ev.city || "",
      country: ev.country || "",
      bedroomCount: ev.bedrooms || "",
      bathroomCount: ev.bathrooms || "",
      pricePerNight: ev.pricePerNight || "",
      rating: ev.rating || "",
      description: ev.description || "",
      coverImage: null,
      interiorImages: [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Kaydet veya güncelle
  const handleSubmit = async () => {
    if (!email) return alert("Giriş yapmadınız!");

    const formData = new FormData();
    formData.append("Title", newHouse.title);
    formData.append("City", newHouse.city);
    formData.append("Country", newHouse.country);
    formData.append("BedroomCount", newHouse.bedroomCount);
    formData.append("BathroomCount", newHouse.bathroomCount);
    formData.append("PricePerNight", newHouse.pricePerNight);
    formData.append("Rating", newHouse.rating);
    formData.append("Description", newHouse.description);
    formData.append("OwnerEmail", email);

    if (newHouse.coverImage) {
      formData.append("CoverImage", newHouse.coverImage);
    }
    newHouse.interiorImages.forEach((img) => {
      formData.append("InteriorImages", img);
    });

    const url = editingId
      ? `http://localhost:5254/api/houses/${editingId}`
      : "http://localhost:5254/api/houses";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { 
        method, 
        body: formData 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Bir hata oluştu");
      }

      const data = await res.json();
      alert(editingId ? "Ev güncellendi!" : "Ev eklendi!");
      
      // Ev listesini güncelle
      await fetchHouses(email);
      
      // Formu temizle
      setNewHouse({
        title: "",
        city: "",
        country: "",
        bedroomCount: "",
        bathroomCount: "",
        pricePerNight: "",
        rating: "",
        description: "",
        coverImage: null,
        interiorImages: [],
      });
      setEditingId(null);
    } catch (err) {
      console.error("Sunucu hatası:", err);
      alert(err.message || "Sunucu hatası!");
    }
  };

  // SİL: DB'den ve listeden kaldır
  const handleDelete = async (id) => {
    if (!window.confirm("Bu evi silmek istediğinizden emin misiniz?")) return;
    const showToast = useToast();
    try {
      const res = await fetch(`http://localhost:5254/api/houses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        let errorMessage = "Silme işlemi başarısız oldu";
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("JSON parse hatası:", e);
        }
        showToast({ message: errorMessage, type: "error" });
        throw new Error(errorMessage);
      }
      showToast({ message: "Ev başarıyla silindi!", type: "success" });
      // Listeyi güncelle
      await fetchHouses(email);
    } catch (error) {
      console.error("Silme hatası:", error);
      showToast({ message: error.message || "Silme işlemi sırasında bir hata oluştu", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-4 text-center text-black">
          {email} - Evlerim
        </h2>

        {/* Ev Ekleme Formu */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              placeholder="Başlık"
              value={newHouse.title}
              onChange={handleInputChange}
              className="input-style text-black placeholder-black"
            />
            <input
              name="city"
              placeholder="Şehir"
              value={newHouse.city}
              onChange={handleInputChange}
              className="input-style text-black placeholder-black"
            />
            <input
              name="country"
              placeholder="Ülke"
              value={newHouse.country}
              onChange={handleInputChange}
              className="input-style text-black placeholder-black"
            />
            <input
              name="bedroomCount"
              type="number"
              placeholder="Yatak Odası"
              value={newHouse.bedroomCount}
              onChange={handleInputChange}
              className="input-style text-black placeholder-black"
            />
            <input
              name="bathroomCount"
              type="number"
              placeholder="Banyo"
              value={newHouse.bathroomCount}
              onChange={handleInputChange}
              className="input-style text-black placeholder-black"
            />
            <input
              name="pricePerNight"
              type="number"
              placeholder="Gecelik Ücret"
              value={newHouse.pricePerNight}
              onChange={handleInputChange}
              className="input-style text-black placeholder-black"
            />
            <input
              name="rating"
              type="number"
              placeholder="Puan"
              value={newHouse.rating}
              onChange={handleInputChange}
              className="input-style text-black placeholder-black"
            />
            <textarea
              name="description"
              placeholder="Açıklama"
              value={newHouse.description}
              onChange={handleInputChange}
              className="input-style text-black placeholder-black"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Kapak Görseli
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              İç Görseller (5 adet)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleInteriorImagesChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingId ? "Güncelle" : "Ev Ekle"}
          </button>
        </div>

        {/* Ev Listesi */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4 text-black">Eklenen Evler</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {houses.map((ev) => (
              <div
                key={ev.houseID}
                className="rounded-xl overflow-hidden shadow-lg bg-white"
              >
                <img
                  src={`http://localhost:5254${ev.coverImageUrl}`}
                  alt="Kapak"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="text-lg font-bold">
                    {ev.title}
                  </div>
                  <div className="text-gray-600">
                    {ev.city}, {ev.country}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {ev.bedroomCount} oda • {ev.bathroomCount} banyo
                  </div>
                  <div className="text-sm font-semibold text-green-700">
                    ₺{ev.pricePerNight} / gece
                  </div>
                  <div className="text-yellow-600 font-semibold">
                    ⭐ {ev.rating}
                  </div>
                  <p className="text-sm italic text-gray-500">
                    {ev.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(ev.interiorImageUrls ? ev.interiorImageUrls.split(',') : []).map((url, i) => (
                      <img
                        key={url + i}
                        src={`http://localhost:5254${url}`}
                        alt={`Görsel ${i + 1}`}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(ev)}
                      className="flex-1 bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(ev.houseID)}
                      className="flex-1 bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          font-size: 0.95rem;
        }
        .input-style:focus {
          outline: none;
          border-color: #2563eb;
          background: #fff;
        }
      `}</style>
    </div>
  );
}
