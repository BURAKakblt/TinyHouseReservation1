"use client";

import React, { useEffect, useState } from "react";
import NewHouseForm from "../components/NewHouseForm";

export default function NewHousePage() {
  const [houses, setHouses] = useState([]);

  // Backend'den evleri çek
  useEffect(() => {
    fetch("http://localhost:5254/api/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data))
      .catch((err) => console.error("Evler yüklenemedi:", err));
  }, []);

  // Yeni ev eklendiğinde listeye ekle
  const handleNewHouseAdded = (newHouse) => {
    setHouses((prev) => [...prev, newHouse]);
  };

  return (
    <div className="p-10">
      <NewHouseForm onNewHouseAdded={handleNewHouseAdded} />

      <h2 className="text-2xl font-bold mt-10 mb-4">Yeni Eklenen Evler</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {houses.map((house) => (
          <div
            key={house.id}
            className="border rounded-lg shadow-md p-4 bg-white"
          >
            <img
              src={`http://localhost:5254/images/${house.imagePath}`}
              alt="Ev Görseli"
              className="w-full h-48 object-cover mb-2 rounded-md"
            />
            <h3 className="text-lg font-semibold">
              {house.city}, {house.country}
            </h3>
            <p>Yatak Odası: {house.bedroomCount}</p>
            <p>Banyo: {house.bathroomCount}</p>
            <p>Gecelik Ücret: ${house.pricePerNight}</p>
            <p>Puan: {house.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
