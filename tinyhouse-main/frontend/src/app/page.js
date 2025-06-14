"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { FaBed, FaBath, FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import useToast from "../components/useToast";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

const HERO_IMAGE = "/ev-resmi.jpeg";

const HomePage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularHouses, setPopularHouses] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    location: "",
    houseType: "",
    dateRange: { start: null, end: null }
  });

  useEffect(() => {
    // Popüler evleri getir
    fetchPopularHouses();
  }, []);

  const fetchPopularHouses = async () => {
    try {
      const response = await fetch("/api/houses/popular");
      const data = await response.json();
      setPopularHouses(data);
    } catch (error) {
      console.error("Popüler evler yüklenirken hata:", error);
    }
  };

  const handleSearch = () => {
    router.push(`/houses?search=${searchQuery}&priceMin=${filters.priceRange[0]}&priceMax=${filters.priceRange[1]}&location=${filters.location}&type=${filters.houseType}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Üstte ortalanmış görsel */}
      <div className="w-full flex justify-center items-center pt-8 pb-4 bg-[#f5f5f5]">
        <img
          src={HERO_IMAGE}
          alt="Tiny House Hero"
          className="object-contain mx-auto rounded-2xl shadow-lg"
          style={{height: '400px', maxWidth: '90vw'}}
        />
      </div>

      {/* Popüler Evler ve diğer içerik burada devam edecek */}

      {/* Altında başlık, açıklama ve butonlar */}
      <div className="flex flex-col items-center justify-center w-full px-4 py-8 bg-transparent">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center tracking-tight text-black drop-shadow-lg">
          Hayalindeki Tiny House'u Bul!
        </h1>
        <p className="text-lg md:text-2xl text-gray-800 mb-8 text-center max-w-2xl drop-shadow">
          Türkiye'nin dört bir yanındaki en güzel tiny house'lar burada. Hemen keşfet, favorini seç ve hayalini yaşa!
        </p>
        <div className="flex gap-4 mb-2">
          <button className="btn" style={{ background: '#7c3aed', color: '#fff' }} onClick={() => router.push('/login')}>Giriş Yap</button>
          <button className="btn" style={{ background: '#6366f1', color: '#fff' }} onClick={() => router.push('/signup')}>Kayıt Ol</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
