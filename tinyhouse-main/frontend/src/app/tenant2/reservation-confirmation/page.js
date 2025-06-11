'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReservationConfirmation() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    // Son rezervasyon bilgisi localStorage'dan alınır
    const last = localStorage.getItem("lastReservationSummary");
    if (last) setSummary(JSON.parse(last));
  }, []);

  if (!summary) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Rezervasyon özeti bulunamadı.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-lg flex flex-col items-center animate-bounce-in">
        <svg className="w-16 h-16 mb-4 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <div className="text-3xl font-bold text-green-700 mb-2">Rezervasyon Başarılı!</div>
        <div className="text-lg text-gray-800 mb-4">Rezervasyon detaylarınız aşağıdadır:</div>
        <div className="bg-gray-100 rounded-lg p-4 w-full mb-4">
          <div className="text-gray-800 font-semibold">Ev: <span className="text-black">{summary.houseTitle}</span></div>
          <div className="text-gray-800">Tarih: <b>{summary.startDate}</b> - <b>{summary.endDate}</b></div>
          <div className="text-gray-800">Kişi: <b>{summary.guests}</b></div>
          <div className="text-gray-800">Toplam Fiyat: <b>{summary.totalPrice} TL</b></div>
        </div>
        <div className="text-green-700 font-semibold mb-2">Rezervasyon bilgileri e-posta ile hem size hem ev sahibine gönderildi.</div>
        <button
          onClick={() => router.push("/tenant2/my-reservations")}
          className="mt-4 bg-green-600 text-white font-bold px-6 py-2 rounded shadow hover:bg-green-700 transition"
        >
          Rezervasyonlarım
        </button>
      </div>
      <style jsx global>{`
      @keyframes bounce-in {
        0% { transform: scale(0.8) translateY(-30px); opacity: 0; }
        60% { transform: scale(1.05) translateY(10px); opacity: 1; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
      .animate-bounce-in { animation: bounce-in 0.7s; }
      `}</style>
    </div>
  );
} 