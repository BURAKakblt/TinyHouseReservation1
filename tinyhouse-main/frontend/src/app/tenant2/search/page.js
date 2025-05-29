"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: "price_asc", // price_asc, price_desc, rating_desc
    amenities: [],
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchSearchResults();
  }, [searchParams]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        location: searchParams.get("location") || "",
        priceRange: searchParams.get("priceRange") || "",
        dateRange: searchParams.get("dateRange") || "",
        houseType: searchParams.get("houseType") || "",
        ...filters
      });

      const response = await fetch(`http://localhost:5254/api/houses/search?${queryParams}`);
      if (!response.ok) {
        throw new Error("Arama sonuçları alınamadı");
      }
      const data = await response.json();
      setHouses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
    fetchSearchResults();
  };

  const handleAmenityToggle = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    setFilters({ ...filters, amenities: newAmenities });
    fetchSearchResults();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sonuçlar yükleniyor...</p>
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık ve Filtreler */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Arama Sonuçları</h1>
            <div className="flex items-center space-x-4">
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
                <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
                <option value="rating_desc">En Yüksek Puan</option>
              </select>
            </div>
          </div>

          {/* Filtreler */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Fiyat</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Min TL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Fiyat</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Max TL"
              />
            </div>
          </div>

          {/* Özellikler */}
          <div className="flex flex-wrap gap-2">
            {["WiFi", "Klima", "Mutfak", "TV", "Park", "Havuz"].map((amenity) => (
              <button
                key={amenity}
                onClick={() => handleAmenityToggle(amenity)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.amenities.includes(amenity)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

        {/* Sonuçlar */}
        {houses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Arama kriterlerinize uygun ev bulunamadı.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Arama Kriterlerini Değiştir
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house) => (
              <div key={house.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={house.imageUrl}
                  alt={house.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{house.title}</h3>
                  <p className="text-gray-600">{house.location}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-blue-600 font-semibold">{house.price} TL/gece</span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{house.rating}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {house.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => router.push(`/tenant2/house/${house.id}`)}
                    className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                  >
                    Detayları Gör
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 