"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaStar, FaBed, FaBath } from "react-icons/fa";

export default function Home1DetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const houseId = searchParams.get('id');
    if (houseId) {
      fetchHouseDetails(houseId);
    } else {
      setError('Ev ID\'si bulunamadı');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchHouseDetails = async (houseId) => {
    try {
      const response = await fetch(`http://localhost:5254/api/houses/${houseId}`);
      if (!response.ok) {
        throw new Error('Ev detayları yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      console.log('API\'den gelen ev detayları:', data);
      setHouse(data);
    } catch (err) {
      console.error('API hatası:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E6DCDC]">
        <div className="text-2xl text-[#260B01]">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E6DCDC]">
        <div className="text-2xl text-red-600">{error || 'Ev bulunamadı'}</div>
      </div>
    );
  }

  const interiorImages = house.interiorImageUrls ? house.interiorImageUrls.split(',') : [];
  const allImages = [`http://localhost:5254${house.coverImageUrl}`, ...interiorImages.map(img => `http://localhost:5254${img}`)];

  return (
    <div className="min-h-screen bg-[#E6DCDC] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Fotoğraf Galerisi */}
          <div className="relative">
            <img
              src={allImages[currentPhotoIndex]}
              alt={house.title}
              className="w-full h-[400px] object-cover"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentPhotoIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
                >
                  →
                </button>
              </>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{house.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{house.city}, {house.country}</p>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <FaBed className="text-[#260B01]" /> {house.bedrooms} Yatak Odası
              </div>
              <div className="flex items-center gap-2">
                <FaBath className="text-[#260B01]" /> {house.bathrooms} Banyo
              </div>
              <div className="flex items-center gap-2 text-yellow-500">
                <FaStar /> {house.rating}
              </div>
            </div>

            <div className="text-2xl font-bold text-[#260B01] mb-6">
              {house.pricePerNight}₺ / gece
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Ev Hakkında</h2>
              <p className="text-gray-600">{house.description}</p>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-[#260B01] hover:bg-[#3d1703] text-white py-3 rounded-lg font-semibold transition text-lg"
            >
              Rezervasyon Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
