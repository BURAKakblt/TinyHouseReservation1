"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaStar, FaBed, FaBath } from "react-icons/fa";

const photos = [
  "/foto9.jpg",
  "/Unknown-62.jpg",
  "/Unknown-55.jpg",
  "/Unknown-54.jpg",
  "/Unknown-61.jpg",
];

const house = {
  location: "Kapadokya, Türkiye",
  beds: 2,
  baths: 1,
  pricePerNight: 1300,
  rating: 4.9,
};

export default function Home2DetailPage() {
  const router = useRouter();
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [nights, setNights] = useState(1);

  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const totalPrice = house.pricePerNight * nights;

  const handleAddToCart = () => {
    router.push("/login");
  };

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-6 text-[#260B01]"
      style={{ backgroundColor: "#E6DCDC" }}
    >
      <div className="relative w-full h-[600px] mb-6 rounded overflow-hidden shadow-lg">
        <img
          src={photos[currentPhoto]}
          alt={`Fotoğraf ${currentPhoto + 1}`}
          className="w-full h-full object-cover"
        />
        <button
          onClick={prevPhoto}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow hover:bg-opacity-90"
          aria-label="Önceki Fotoğraf"
        >
          ‹
        </button>
        <button
          onClick={nextPhoto}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow hover:bg-opacity-90"
          aria-label="Sonraki Fotoğraf"
        >
          ›
        </button>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPhoto(i)}
              className={`w-3 h-3 rounded-full ${
                i === currentPhoto ? "bg-[#260B01]" : "bg-gray-400"
              }`}
              aria-label={`Fotoğraf ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-2xl font-semibold mb-2">{house.location}</h2>
        <div className="flex items-center gap-4 mb-2 text-[#260B01]">
          <div className="flex items-center gap-1">
            <FaBed /> {house.beds} Yatak Odası
          </div>
          <div className="flex items-center gap-1">
            <FaBath /> {house.baths} Banyo
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <FaStar /> {house.rating}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <label htmlFor="nights" className="font-semibold text-[#260B01]">
          Kaç gün kalacaksınız?
        </label>
        <input
          type="number"
          id="nights"
          min={1}
          value={nights}
          onChange={(e) => setNights(Math.max(1, Number(e.target.value)))}
          className="border rounded px-3 py-1 w-20 text-[#260B01]"
        />
        <div className="text-lg font-bold text-[#260B01]">
          Toplam Fiyat: {totalPrice}₺
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full bg-[#260B01] hover:bg-[#3d1703] text-white py-3 rounded font-semibold transition"
      >
        Sepete Ekle
      </button>
    </div>
  );
}
