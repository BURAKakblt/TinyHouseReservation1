"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CgArrowRightO, CgHomeAlt, CgHeart, CgProfile } from "react-icons/cg";

const Navbar = () => {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const loginRef = useRef();
  const featuresRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        loginRef.current &&
        !loginRef.current.contains(event.target) &&
        isLoginOpen
      ) {
        setIsLoginOpen(false);
      }
      if (
        featuresRef.current &&
        !featuresRef.current.contains(event.target) &&
        isFeaturesOpen
      ) {
        setIsFeaturesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLoginOpen, isFeaturesOpen]);

  const checkCity = async () => {
    if (!city) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/cities/check?name=${city}`
      );
      const data = await res.json();

      if (data.valid) {
        router.push(`/sehir/${city.toLowerCase()}`);
      } else {
        setError("Geçersiz bir il girdiniz.");
      }
    } catch (err) {
      console.error("API hatası:", err);
      setError("Sunucu hatası oluştu.");
    }
  };

  return (
    <nav className="bg-[#b4b4b4] border-b border-gray-200 px-4 py-5 flex flex-wrap items-center justify-between">
      {/* Sol taraf */}
      <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
        <div className="text-2xl font-bold whitespace-nowrap">MyTinyHouse</div>

        {/* Home */}
        <div>
          <Link
            href="/"
            className="flex items-center gap-1 text-[#260B01] ml-5"
          >
            <span>Home</span>
            <CgHomeAlt className="text-[#260B01] text-lg" />
          </Link>
        </div>

        {/* Favoriler Dropdown */}
        <div className="relative" ref={featuresRef}>
          <button
            onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
            className="text-[#260B01] flex items-center gap-1 ml-5"
          >
            <span>Favoriler</span>
            <CgHeart className="text-[#260B01] text-lg" />
          </button>
          {isFeaturesOpen && (
            <div className="absolute mt-2 w-40 bg-white border rounded shadow z-10">
              <Link
                href="/favoriler"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Favori İlanlar
              </Link>
            </div>
          )}
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
      <div className="relative mt-3 sm:mt-0" ref={loginRef}>
        <button
          onClick={() => setIsLoginOpen(!isLoginOpen)}
          className="text-[#260B01] flex items-center"
        >
          <span className="text-4xl mr-4 ml-25">
            <CgProfile />
          </span>
        </button>
        {isLoginOpen && (
          <div className="absolute mt-2 right-0 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <Link href="/login" className="block px-4 py-2 hover:bg-gray-100">
              Giriş Yap
            </Link>
            <Link href="/signup" className="block px-4 py-2 hover:bg-gray-100">
              Kaydol
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
