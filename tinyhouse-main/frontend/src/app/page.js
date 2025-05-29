"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { FaBed, FaBath, FaStar, FaHeart, FaRegHeart } from "react-icons/fa";

const houses = [
  // Aynı ev verileri...
   {
    id: 1,
    location: "İzmir, Türkiye",
    beds: 2,
    baths: 1,
    price: 1200,
    rating: 4.8,
    image: "/Unknown-49.jpg",
  },
  {
    id: 2,
    location: "Antalya, Türkiye",
    beds: 3,
    baths: 2,
    price: 1500,
    rating: 4.7,
    image: "/Unknown-57.jpg",
  },
{ 
    id: 3,
    location: "Muğla, Türkiye",
    beds: 1,
    baths: 1,
    price: 1000,
    rating: 4.6,
    image: "/foto2.jpg",
}
];

const HomePage = () => {
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [favorites, setFavorites] = useState(houses.map(() => false));
  const [dbHouses, setDbHouses] = useState([]);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  const toggleFavorite = (index) => {
    const updated = [...favorites];
    updated[index] = !updated[index];
    setFavorites(updated);
  };

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await fetch('http://localhost:5254/api/houses/all');
        if (!response.ok) {
          throw new Error('Evler yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        console.log('API\'den gelen evler:', data);
        setDbHouses(data || []);
      } catch (err) {
        console.error('API hatası:', err);
        setError(err.message);
      }
    };

    fetchHouses();
  }, []);

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const allHouses = [
    ...houses,
    ...dbHouses.map((ev) => ({
      id: ev.houseID,
      location: `${ev.city}, ${ev.country}`,
      beds: ev.bedrooms,
      baths: ev.bathrooms,
      price: ev.pricePerNight,
      rating: ev.rating,
      image: "http://localhost:5254" + ev.coverImageUrl,
    })),
  ];

  const totalGuests = adultCount + childCount;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="text-2xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-screen bg-[#f0f0f0]">
      <h1 className="text-4xl font-bold mb-6 text-black tracking-wide">Tiny House</h1>

      {/* Ev Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-6xl text-black">
        {allHouses.map((house, index) => (
          <Link
            key={house.id + "_" + index}
            href={`/houses/home1?id=${house.id}`}
            className="block bg-white rounded-lg overflow-hidden shadow-md relative hover:shadow-xl transition-shadow duration-300"
          >
            <img src={house.image} alt={`Ev ${house.id}`} className="w-full h-48 object-cover" />
            {index < houses.length && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(index);
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-red-500 text-xl"
                aria-label="Favori"
              >
                {favorites[index] ? <FaHeart /> : <FaRegHeart />}
              </button>
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1">{house.location}</h2>
              <div className="flex items-center gap-4 text-sm mb-2">
                <span className="flex items-center gap-1"><FaBed /> {house.beds} Yatak</span>
                <span className="flex items-center gap-1"><FaBath /> {house.baths} Banyo</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold">₺{house.price}/gece</span>
                <span className="flex items-center gap-1 text-yellow-500"><FaStar /> {house.rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
