"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function HouseDetail() {
  const params = useParams();
  const id = params?.id;
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const fetchHouse = async () => {
      try {
        const res = await fetch(`http://localhost:5254/api/houses/${id}`);
        if (!res.ok) throw new Error("Ev bulunamadı");
        const data = await res.json();
        setHouse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHouse();
  }, [id]);

  if (loading) return <div className="p-8">Yükleniyor...</div>;
  if (error) return <div className="p-8 text-red-600">Hata: {error}</div>;
  if (!house) return <div className="p-8">Ev bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2 text-blue-700">{house.title}</h1>
        <div className="text-gray-600 mb-2">{house.city}, {house.country}</div>
        <div className="mb-4 text-black">{house.description}</div>
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full mr-2">Fiyat: {house.pricePerNight?.toLocaleString("tr-TR")} ₺ / gece</span>
          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full mr-2">Oda: {house.bedrooms}</span>
          <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full mr-2">Banyo: {house.bathrooms}</span>
          <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Puan: {house.rating?.toFixed(1) ?? '-'}</span>
        </div>
        {house.coverImageUrl && (
          <img src={`http://localhost:5254${house.coverImageUrl}`} alt="Kapak" className="w-full h-64 object-cover rounded-xl mb-4" />
        )}
        {house.interiorImageUrl && (
          <div className="mb-4">
            <div className="font-semibold mb-2">İç Görseller:</div>
            <img src={`http://localhost:5254${house.interiorImageUrl}`} alt="İç Görsel" className="w-32 h-32 object-cover rounded-lg inline-block mr-2" />
          </div>
        )}
        {house.features && (
          <div className="mb-4">
            <div className="font-semibold mb-2">Özellikler:</div>
            <ul className="list-disc list-inside text-black">
              {house.features.split(",").map((f, i) => (
                <li key={i}>{f.trim()}</li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={() => router.back()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Geri Dön</button>
      </div>
    </div>
  );
} 