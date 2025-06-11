"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CgArrowRightO, CgHomeAlt, CgHeart } from "react-icons/cg";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      const userStr = localStorage.getItem("user");
      let userObj = null;
      try {
        if (userStr && userStr !== "undefined") {
          userObj = JSON.parse(userStr);
        }
      } catch (e) {
        userObj = null;
      }
      setUser(userObj);
    };
    window.addEventListener("storage", syncUser);
    syncUser();
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5254/api/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    setHamburgerOpen(false);
    router.push("/");
  };

  const checkCity = async () => {
    if (!city) return;
    try {
      router.push(`/sehir/${city.toLowerCase()}`);
    } catch (err) {
      setError("Sunucu hatası oluştu.");
    }
  };

  return (
    <nav className="bg-[#b4b4b4] border-b border-gray-200 px-4 py-5 flex items-center justify-between">
      {/* Sol taraf */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="text-2xl font-bold whitespace-nowrap text-[#260B01]">MyTinyHouse</div>
        <Link href="/" className="flex items-center gap-1 text-[#260B01] ml-5">
          <span>Home</span>
          <CgHomeAlt className="text-[#260B01] text-lg" />
        </Link>
        <Link href="/favoriler" className="flex items-center gap-1 text-[#260B01] ml-5">
          <span>Favoriler</span>
          <CgHeart className="text-[#260B01] text-lg" />
        </Link>
        <div className="relative flex-grow max-w-xl w-full min-w-[200px] ml-20">
          <input
            type="text"
            placeholder="Aramak istediğiniz şehri seçiniz..."
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setError("");
            }}
            className="w-full border border-gray-300 rounded-full px-4 py-3 text-sm pr-10"
          />
          <button
            onClick={checkCity}
            className="absolute inset-y-0 right-3 flex items-center text-[#261C14]"
          >
            <CgArrowRightO className="text-xl" />
          </button>
          {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
        </div>
      </div>
      {/* Sağ üst hamburger menü */}
      <div className="relative ml-4">
        <button
          className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white text-2xl focus:outline-none shadow hover:bg-indigo-700 transition md:hidden"
          onClick={() => setHamburgerOpen(!hamburgerOpen)}
          aria-label="Menüyü Aç/Kapat"
        >
          {hamburgerOpen ? <FiX /> : <FiMenu />}
        </button>
        {/* Masaüstü için menü */}
        <div className="hidden md:flex gap-2">
          {!user ? (
            <>
              <Link href="/login" className="px-5 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition">Giriş Yap</Link>
              <Link href="/signup" className="px-5 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition">Kaydol</Link>
            </>
          ) : (
            <>
              <span className="px-4 py-2 text-indigo-700 font-semibold">{user.email}</span>
              <Link href="/owner2/dashboard" className="px-5 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition">Evlerim</Link>
              <Link href="/owner2/add-house" className="px-5 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition">Yeni Ev Ekle</Link>
              <button onClick={handleLogout} className="px-5 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition">Çıkış Yap</button>
            </>
          )}
        </div>
        {/* Hamburger açılır menü */}
        {hamburgerOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col p-2 md:hidden">
            {!user ? (
              <>
                <Link href="/login" className="block px-4 py-2 rounded hover:bg-indigo-50 text-indigo-700 font-semibold" onClick={() => setHamburgerOpen(false)}>Giriş Yap</Link>
                <Link href="/signup" className="block px-4 py-2 rounded hover:bg-indigo-50 text-indigo-700 font-semibold" onClick={() => setHamburgerOpen(false)}>Kaydol</Link>
              </>
            ) : (
              <>
                <span className="block px-4 py-2 text-indigo-700 font-semibold">{user.email}</span>
                <Link href="/owner2/dashboard" className="block px-4 py-2 rounded hover:bg-indigo-50 text-indigo-700 font-semibold" onClick={() => setHamburgerOpen(false)}>Evlerim</Link>
                <Link href="/owner2/add-house" className="block px-4 py-2 rounded hover:bg-indigo-50 text-indigo-700 font-semibold" onClick={() => setHamburgerOpen(false)}>Yeni Ev Ekle</Link>
                <button onClick={() => { handleLogout(); setHamburgerOpen(false); }} className="block w-full text-left px-4 py-2 rounded hover:bg-red-50 text-red-600 font-semibold">Çıkış Yap</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
