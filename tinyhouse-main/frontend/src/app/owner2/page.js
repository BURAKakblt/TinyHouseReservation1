"use client";

import React, { useEffect, useState } from "react";

export default function NewHouseForm() {
  const [email, setEmail] = useState("");
  const [houses, setHouses] = useState([]);
  const [newHouse, setNewHouse] = useState({
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

  // Evleri çek
  const fetchHouses = async (emailToFetch = email) => {
    const res = await fetch(
      `http://localhost:5254/api/houses?email=${emailToFetch}`
    );
    const data = await res.json();
    setHouses(data || []);
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
      fetchHouses(storedEmail);
    }
  }, []);

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

  // Kaydet veya güncelle
  const handleSubmit = async () => {
    if (!email) return alert("Giriş yapmadınız!");

    const formData = new FormData();
    formData.append("City", newHouse.city);
    formData.append("Country", newHouse.country);
    formData.append("BedroomCount", newHouse.bedroomCount);
    formData.append("BathroomCount", newHouse.bathroomCount);
    formData.append("PricePerNight", newHouse.pricePerNight);
    formData.append("Rating", newHouse.rating);
    formData.append("Description", newHouse.description);
    formData.append("OwnerEmail", email);

    // Yeni fotoğraf yüklendiyse ekle
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
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (res.ok) {
        alert(editingId ? "Ev güncellendi!" : "Ev eklendi!");
        fetchHouses();
        setNewHouse({
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
      } else {
        alert(data.message || "Hata oluştu.");
      }
    } catch (err) {
      console.error("Sunucu hatası:", err);
      alert("Sunucu hatası!");
    }
  };

  // DÜZENLE: Bilgileri forma doldur
  const handleEdit = (ev) => {
    setEditingId(ev.id);
    setNewHouse({
      city: ev.city ?? "",
      country: ev.country ?? "",
      bedroomCount: ev.bedroomCount ?? "",
      bathroomCount: ev.bathroomCount ?? "",
      pricePerNight: ev.pricePerNight ?? "",
      rating: ev.rating ?? "",
      description: ev.description ?? "",
      coverImage: null, // Eski görseli forma getirmiyoruz, istenirse yeni seçilebilir
      interiorImages: [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Kullanıcıyı forma getir!
  };

  // SİL: DB'den ve listeden kaldır
  const handleDelete = async (id) => {
    if (!window.confirm("Bu evi silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`http://localhost:5254/api/houses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHouses((prev) => prev.filter((h) => h.id !== id));
        alert("Ev başarıyla silindi!");
      } else {
        alert("Silme başarısız.");
      }
    } catch {
      alert("Sunucu hatası.");
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
              name="city"
              placeholder="Şehir"
              value={newHouse.city}
              onChange={handleInputChange}
className="input-style text-black placeholder-black"            />
            <input
              name="country"
              placeholder="Ülke"
              value={newHouse.country}
              onChange={handleInputChange}
className="input-style text-black placeholder-black"            />
            <input
              name="bedroomCount"
              type="number"
              placeholder="Yatak Odası"
              value={newHouse.bedroomCount}
              onChange={handleInputChange}
className="input-style text-black placeholder-black"            />
            <input
              name="bathroomCount"
              type="number"
              placeholder="Banyo"
              value={newHouse.bathroomCount}
              onChange={handleInputChange}
className="input-style text-black placeholder-black"            />
            <input
              name="pricePerNight"
              type="number"
              placeholder="Gecelik Ücret"
              value={newHouse.pricePerNight}
              onChange={handleInputChange}
className="input-style text-black placeholder-black"            />
            <input
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="Puan (0-5)"
              value={newHouse.rating}
              onChange={handleInputChange}
className="input-style text-black placeholder-black"            />
          </div>
          <textarea
            name="description"
            placeholder="Ev açıklaması..."
            value={newHouse.description}
            onChange={handleInputChange}
/*className="input-style text-black placeholder-black"          />
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            */
className="input-style text-black placeholder-black"          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleInteriorImagesChange}
className="input-style text-black placeholder-black"          />
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-900 transition"
          >
            {editingId ? "Evi Güncelle" : "Ev Ekle"}
          </button>
        </div>

        {/* Ev Listesi */}
        <div>
          <h3 className="text-black font-semibold mb-2">Eklenen Evler</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {houses.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl overflow-hidden shadow-lg bg-white"
              >
                <img
                  src={`http://localhost:5254${ev.coverImageUrl}`}
                  alt="Kapak"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="text-lg font-bold">
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
                    {(ev.interiorImageUrls || []).map((url, i) => (
                      <img
                        key={i}
                        src={`http://localhost:5254${url}`}
                        alt={`Görsel ${i + 1}`}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(ev)}
                      className="flex-1 bg-yellow-400 text-xs py-1 rounded-md"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="flex-1 bg-red-500 text-white text-xs py-1 rounded-md"
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
