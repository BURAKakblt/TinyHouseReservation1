"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TenantDashboard() {
  const router = useRouter();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    guests: "",
    startDate: "",
    endDate: "",
    houseType: ""
  });

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5254/api/houses?available=true");
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Sunucudan geçersiz veri formatı alındı");
      }
      setHouses(data);
    } catch (error) {
      console.error("Evler yüklenirken hata:", error);
      setError(error.message || "Evler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredHouses = houses.filter(house => {
      return (
        (!searchParams.city || house.city.toLowerCase().includes(searchParams.city.toLowerCase())) &&
        (!searchParams.minPrice || house.pricePerNight >= parseInt(searchParams.minPrice)) &&
        (!searchParams.maxPrice || house.pricePerNight <= parseInt(searchParams.maxPrice)) &&
        (!searchParams.guests || house.maxGuests >= parseInt(searchParams.guests)) &&
        (!searchParams.houseType || house.houseType === searchParams.houseType)
      );
    });
    setHouses(filteredHouses);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#260B01] mx-auto"></div>
          <p className="mt-4 text-black font-medium">Yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-red-600"
        >
          <p className="font-medium text-black">Hata: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#260B01] text-white px-4 py-2 rounded hover:bg-[#3e2010] transition"
          >
            Yeniden Dene
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Navbar veya üst kısım */}
        <div className="flex justify-end items-center p-4 gap-4">
          <button
            onClick={() => router.push("/tenant2/my-reservations")}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow hover:from-blue-600 hover:to-blue-800 transition-all"
          >
            Rezervasyonlarım
          </button>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bold px-4 py-2 rounded-xl shadow hover:from-red-600 hover:to-red-800 transition-all"
          >
            Çıkış Yap
          </button>
        </div>
        {/* Arama Formu */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Şehir</label>
              <input
                type="text"
                value={searchParams.city}
                onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition text-black"
                placeholder="Şehir ara..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Ev Tipi</label>
              <select
                value={searchParams.houseType}
                onChange={(e) => setSearchParams({ ...searchParams, houseType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition text-black"
              >
                <option value="">Tümü</option>
                <option value="Tiny House">Tiny House</option>
                <option value="Villa">Villa</option>
                <option value="Bungalov">Bungalov</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Min. Fiyat</label>
              <input
                type="number"
                value={searchParams.minPrice}
                onChange={(e) => setSearchParams({ ...searchParams, minPrice: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition text-black"
                placeholder="Min. fiyat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Max. Fiyat</label>
              <input
                type="number"
                value={searchParams.maxPrice}
                onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition text-black"
                placeholder="Max. fiyat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Kişi Sayısı</label>
              <input
                type="number"
                value={searchParams.guests}
                onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition text-black"
                placeholder="Kişi sayısı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Giriş Tarihi</label>
              <input
                type="date"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition text-black"
                placeholder="Giriş tarihi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Çıkış Tarihi</label>
              <input
                type="date"
                value={searchParams.endDate}
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#260B01] focus:ring-2 focus:ring-[#260B01]/20 transition text-black"
                placeholder="Çıkış tarihi"
                min={searchParams.startDate}
              />
            </div>
            <div className="md:col-span-7">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-[#260B01] text-white py-3 rounded-lg hover:bg-[#3e2010] transition font-medium"
              >
                Ara
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Popüler Evler Bölümü */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#260B01]">Popüler Evler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {houses
              .slice() // orijinal diziyi bozmamak için kopya
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map((house) => (
                <div key={house.houseID} className="bg-white rounded-xl shadow-sm overflow-hidden border border-yellow-200 hover:shadow-md transition">
                  <Link href={`/tenant2/house/${house.houseID}`}>
                    <div className="relative">
                      <img
                        src={`http://localhost:5254${house.coverImageUrl}`}
                        alt={house.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-yellow-400/90 px-3 py-1 rounded-full text-[#260B01] font-bold">
                        ★ {house.rating}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-black mb-1">{house.title}</h3>
                      <div className="text-gray-600 text-sm mb-2">{house.city}, {house.country}</div>
                      <div className="font-medium text-[#260B01]">{house.pricePerNight} TL/gece</div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </div>

        {/* Ev Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house, index) => {
            const featuresArray = house.features
              ? (typeof house.features === "string"
                  ? house.features.split(",").map(f => f.trim()).filter(f => f)
                  : Array.isArray(house.features)
                    ? house.features
                    : [])
              : [];
            return (
              <motion.div
                key={house.houseID}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition"
              >
                <Link href={`/tenant2/house/${house.houseID}`}>
                  <div className="relative">
                    <img
                      src={`http://localhost:5254${house.coverImageUrl}`}
                      alt={house.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-[#260B01] font-medium">
                      {house.pricePerNight} TL/gece
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-black mb-2">{house.title}</h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {house.city}, {house.country}
                    </div>
                    <div className="flex items-center justify-between text-gray-600 mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {house.maxGuests} Kişilik
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {house.bedrooms} Yatak Odası
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuresArray.slice(0, 3).map((feature, i) => (
                        <span key={i} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                      {featuresArray.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                          +{featuresArray.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-xl">★</span>
                        <span className="ml-2 text-black">{house.rating}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#260B01] text-white px-4 py-2 rounded-lg hover:bg-[#3e2010] transition"
                      >
                        Detayları Gör
                      </motion.button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
