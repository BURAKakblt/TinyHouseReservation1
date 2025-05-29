"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReservationConfirmation({ params }) {
  const router = useRouter();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReservationDetails();
  }, [params.id]);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5254/api/reservations/${params.id}`);
      
      if (!response.ok) {
        throw new Error("Rezervasyon detayları alınamadı");
      }
      
      const data = await response.json();
      setReservation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Hata: {error || "Rezervasyon bulunamadı"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Rezervasyon Onaylandı!</h1>
            <p className="text-gray-600 mt-2">
              Rezervasyon detaylarınız aşağıda yer almaktadır.
            </p>
          </div>

          <div className="border-t border-b py-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Rezervasyon Numarası</span>
              <span className="font-medium">{reservation.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ev</span>
              <span className="font-medium">{reservation.house.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Konum</span>
              <span className="font-medium">{reservation.house.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giriş Tarihi</span>
              <span className="font-medium">
                {new Date(reservation.checkIn).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Çıkış Tarihi</span>
              <span className="font-medium">
                {new Date(reservation.checkOut).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Misafir Sayısı</span>
              <span className="font-medium">{reservation.guests} kişi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Tutar</span>
              <span className="font-medium">{reservation.totalPrice} TL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ödeme Durumu</span>
              <span className="font-medium text-green-600">Ödendi</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Önemli Bilgiler</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Rezervasyon detaylarınız e-posta adresinize gönderilmiştir.</li>
                <li>• Giriş saatinden önce ev sahibi ile iletişime geçebilirsiniz.</li>
                <li>• Herhangi bir sorunuz olursa destek ekibimizle iletişime geçebilirsiniz.</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/tenant2/my-reservations")}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Rezervasyonlarım
              </button>
              <button
                onClick={() => router.push("/tenant2")}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
              >
                Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 