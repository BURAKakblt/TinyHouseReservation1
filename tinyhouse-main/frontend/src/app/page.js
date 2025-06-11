"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { FaBed, FaBath, FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import useToast from "../components/useToast";

const HomePage = () => {
  const [dbHouses, setDbHouses] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const showToast = useToast();

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await fetch('http://localhost:5254/api/houses');
        if (!response.ok) {
          throw new Error('Evler yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        // Sadece ownerID dolu olan evleri filtrele
        const ownerHouses = (data || []).filter(ev => ev.ownerID);
        setDbHouses(ownerHouses);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchHouses();
  }, []);

  const handleHouseClick = (houseID) => {
    const role = localStorage.getItem("role");
    if (role !== "tenant") {
      showToast({ message: "Lütfen giriş yapınız!", type: "info" });
      router.push("/login?redirect=tenant2");
    } else {
      showToast({ message: "Ev detayına yönlendiriliyorsunuz!", type: "success" });
      router.push(`/tenant2?houseId=${houseID}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="text-2xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-screen" style={{ background: '#f5f5f5' }}>
      <h1 className="text-4xl font-bold mb-6 tracking-wide" style={{ color: 'var(--accent)' }}>Tiny House</h1>
      {/* Ev Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-6xl" style={{ color: 'var(--foreground)', background: '#f5f5f5' }}>
        {dbHouses.map((ev, index) => (
          <button
            key={ev.houseID + '_' + index}
            onClick={() => handleHouseClick(ev.houseID)}
            className="house-card overflow-hidden relative text-left w-full"
            style={{ minHeight: 340 }}
          >
            <img src={ev.coverImageUrl.startsWith('http') ? ev.coverImageUrl : `http://localhost:5254${ev.coverImageUrl}`} alt={`Ev ${ev.houseID}`} className="w-full h-48 object-cover" style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{ev.city}, {ev.country}</h2>
              <div className="flex items-center gap-4 text-sm mb-2">
                <span className="flex items-center gap-1"><FaBed /> {ev.bedrooms} Yatak</span>
                <span className="flex items-center gap-1"><FaBath /> {ev.bathrooms || ev.bathroomCount || 1} Banyo</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold">₺{ev.pricePerNight}/gece</span>
                <span className="flex items-center gap-1 text-yellow-600"><FaStar /> {ev.rating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
