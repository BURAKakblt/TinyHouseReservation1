"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaStar, FaFilter } from "react-icons/fa";

const HousesPage = () => {
  const searchParams = useSearchParams();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    priceMin: searchParams.get("priceMin") || 0,
    priceMax: searchParams.get("priceMax") || 10000,
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    sortBy: "rating"
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHouses();
  }, [filters]);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search: filters.search,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        location: filters.location,
        type: filters.type,
        sortBy: filters.sortBy
      });

      const response = await fetch(`/api/houses?${queryParams}`);
      const data = await response.json();
      setHouses(data);
    } catch (error) {
      console.error("Evler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Filtreler */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            <span>Filtreler</span>
          </button>

          {showFilters && (
            <div className="mt-4 bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Arama</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    placeholder="Ev adı veya konum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fiyat Aralığı</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Konum</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                    placeholder="Şehir veya bölge"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sıralama</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  >
                    <option value="rating">Puana Göre</option>
                    <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
                    <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
                    <option value="newest">En Yeni</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ev Listesi */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {houses.map((house) => (
              <div key={house.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={house.image}
                  alt={house.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{house.title}</h3>
                  <p className="text-gray-600 mb-2">{house.location}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{house.price} TL/gece</span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span>{house.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sonuç Bulunamadı */}
        {!loading && houses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700">Sonuç Bulunamadı</h3>
            <p className="text-gray-500 mt-2">Lütfen farklı filtreler deneyin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HousesPage; 