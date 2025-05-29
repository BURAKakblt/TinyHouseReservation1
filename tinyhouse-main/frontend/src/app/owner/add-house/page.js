"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AddHouse = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    country: "",
    bedrooms: "",
    bathrooms: "",
    pricePerNight: "",
    rating: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [interiorImages, setInteriorImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      router.push("/login");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      if (files.length !== 5) {
        setError("Lütfen tam olarak 5 adet iç mekan fotoğrafı seçin.");
        return;
      }
      setInteriorImages(files);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      formDataToSend.append("OwnerEmail", localStorage.getItem("email"));
      formDataToSend.append("CoverImage", coverImage);

      interiorImages.forEach((image, index) => {
        formDataToSend.append("InteriorImages", image);
      });

      const response = await fetch("http://localhost:5254/api/houses", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        router.push("/owner/dashboard");
      } else {
        const data = await response.json();
        setError(data.message || "İlan eklenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("İlan eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-black">Yeni İlan Ekle</h2>
        {error && <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-black">Başlık</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="input-style text-black placeholder-gray-400" required />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-black">Şehir</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="input-style text-black placeholder-gray-400" required />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-black">Ülke</label>
              <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="input-style text-black placeholder-gray-400" required />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-black">Yatak Odası</label>
              <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} className="input-style text-black placeholder-gray-400" required />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-black">Banyo</label>
              <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} className="input-style text-black placeholder-gray-400" required />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-black">Gecelik Ücret</label>
              <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleInputChange} className="input-style text-black placeholder-gray-400" required />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-black">Puan</label>
              <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} className="input-style text-black placeholder-gray-400" required />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-black">Açıklama</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="input-style text-black placeholder-gray-400" rows={3} required />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-black">Kapak Görseli</label>
            <input type="file" accept="image/*" onChange={handleCoverImageChange} className="block w-full text-black" required />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-black">İç Görseller (5 adet)</label>
            <input type="file" accept="image/*" multiple onChange={handleInteriorImagesChange} className="block w-full text-black" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg">
            {loading ? "Kaydediliyor..." : "İlanı Kaydet"}
          </button>
        </form>
        <style jsx>{`
          .input-style {
            width: 100%;
            padding: 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid #d1d5db;
            background: #f9fafb;
            font-size: 1rem;
            color: #000;
          }
          .input-style:focus {
            outline: none;
            border-color: #2563eb;
            background: #fff;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddHouse; 