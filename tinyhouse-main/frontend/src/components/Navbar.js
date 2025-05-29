"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CgArrowRightO, CgHomeAlt, CgHeart } from "react-icons/cg";

const Navbar = () => {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

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
    setIsMenuOpen(false);
    router.push("/");
  };

  const checkCity = async () => {
    if (!city) return;
    try {
      // Şehir kontrolü API'si örnek, gerekirse güncellenebilir
      router.push(`/sehir/${city.toLowerCase()}`);
    } catch (err) {
      setError("Sunucu hatası oluştu.");
    }
  };

  // Kullanıcı baş harfi
  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <nav className="bg-[#b4b4b4] border-b border-gray-200 px-4 py-5 flex flex-wrap items-center justify-between">
      {/* Sol taraf */}
      <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
        <div className="text-2xl font-bold whitespace-nowrap text-[#260B01]">MyTinyHouse</div>
        <div>
          <Link href="/" className="flex items-center gap-1 text-[#260B01] ml-5">
            <span>Home</span>
            <CgHomeAlt className="text-[#260B01] text-lg" />
          </Link>
        </div>
        <div className="relative">
          <Link href="/favoriler" className="flex items-center gap-1 text-[#260B01] ml-5">
            <span>Favoriler</span>
            <CgHeart className="text-[#260B01] text-lg" />
          </Link>
        </div>
        {/* Arama Çubuğu */}
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
      {/* Sağ taraf */}
      <div className="relative mt-3 sm:mt-0" ref={menuRef}>
        {!user ? (
          <div className="flex gap-2">
            <Link
              href="/login"
              className="px-5 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
            >
              Giriş Yap
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition"
            >
              Kaydol
            </Link>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white text-xl font-bold focus:outline-none shadow hover:bg-indigo-700 transition"
              aria-label="Kullanıcı menüsü"
            >
              {userInitial}
            </button>
            {isMenuOpen && (
              <div className="absolute mt-2 right-0 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <div className="px-4 py-3 border-b text-gray-700 font-semibold">
                  {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email}
                </div>
                {user.role === "tenant" && (
                  <Link href="/tenant2" className="block px-4 py-2 hover:bg-gray-100">Kiracı Paneli</Link>
                )}
                {user.role === "owner" && (
                  <Link href="/owner2/dashboard" className="block px-4 py-2 hover:bg-gray-100">İlan Sahibi Paneli</Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin-panel" className="block px-4 py-2 hover:bg-gray-100">Admin Paneli</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 border-t"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
