"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EditHouse = ({ params }) => {
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
        `http://localhost:5254/api/houses/${params.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title,
          description: data.description,
          city: data.city,
          country: data.country,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          pricePerNight: data.pricePerNight,
          rating: data.rating,
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

      const response = await fetch(
        `http://localhost:5254/api/houses/${params.id}`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        router.push("/owner/dashboard");
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

  if (loading) return <div className="p-8">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">İlanı Düzenle</h1>
            <Link
              href="/owner/dashboard"
              className="text-blue-600 hover:text-blue-800"
            >
              Geri Dön
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                İlan Başlığı
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Şehir
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ülke
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Yatak Odası Sayısı
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Banyo Sayısı
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gecelik Fiyat (₺)
                </label>
                <input
                  type="number"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Puan (1-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="5"
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kapak Fotoğrafı (Değiştirmek için seçin)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                İç Mekan Fotoğrafları (Değiştirmek için 5 adet seçin)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleInteriorImagesChange}
                className="mt-1 block w-full"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditHouse; 