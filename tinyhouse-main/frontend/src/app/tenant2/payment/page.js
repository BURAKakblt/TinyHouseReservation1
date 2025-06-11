'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const [reservation, setReservation] = useState(null);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const res = localStorage.getItem("pendingReservation");
      if (res) setReservation(JSON.parse(res));
    }
  }, []);

  if (!reservation) {
    return <div className="p-8 text-center text-red-600 font-bold">Rezervasyon bilgisi bulunamadı.</div>;
  }

  const handlePay = async () => {
    setError("");
    if (!card.number || !card.name || !card.expiry || !card.cvc) {
      setError("Lütfen tüm kart bilgilerini doldurun.");
      return;
    }
    if (!reservation.houseID) {
      setError("Ev bilgisi bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
      return;
    }
    // Backend'e rezervasyon kaydı gönder
    try {
      const email = localStorage.getItem("email");
      if (!email) {
        setError("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }
      const response = await fetch("http://localhost:5254/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          HouseID: reservation.houseID,
          Email: email,
          StartDate: reservation.startDate,
          EndDate: reservation.endDate,
          TotalPrice: reservation.totalPrice,
          Guests: reservation.guests
        })
      });
      if (!response.ok) {
        setError("Rezervasyon kaydedilemedi. Lütfen tekrar deneyin.");
        return;
      }
      // Rezervasyon kaydı başarılıysa, mail gönder
      try {
        const mailBody = {
          tenantEmail: email,
          ownerEmail: reservation.ownerEmail || "evsahibi@example.com",
          houseTitle: reservation.houseTitle,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          guests: reservation.guests,
          totalPrice: reservation.totalPrice
        };
        console.log("Mail gönderme isteği başlatılıyor:", mailBody);
        const mailRes = await fetch("http://localhost:5254/api/send-reservation-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mailBody)
        });
        console.log("Mail gönderme isteği tamamlandı. Yanıt:", mailRes);
        if (!mailRes.ok) {
          const mailErr = await mailRes.json().catch(() => ({}));
          setError((mailErr.message ? mailErr.message + ' (Detay: ' + (mailErr.error || '') + ')' : "E-posta gönderilemedi"));
        }
      } catch (err) {
        setError("Mail gönderme hatası: " + err.message);
      }
      setSuccess(true);
      localStorage.setItem("lastReservationSummary", JSON.stringify(reservation));
      setTimeout(() => {
        localStorage.removeItem("pendingReservation");
        router.push("/tenant2/reservation-confirmation");
      }, 2000);
    } catch (err) {
      setError("Sunucu hatası: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Ödeme Yap</h2>
        <div className="mb-4">
          <div className="text-gray-700 font-semibold">Ev: <span className="text-black">{reservation.houseTitle}</span></div>
          <div className="text-gray-700">Tarih: <b>{reservation.startDate}</b> - <b>{reservation.endDate}</b></div>
          <div className="text-gray-700">Kişi: <b>{reservation.guests}</b></div>
          <div className="text-gray-700">Toplam Fiyat: <b>{reservation.totalPrice} TL</b></div>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Kart Numarası</label>
            <input type="text" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" placeholder="1234 5678 9012 3456" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Kart Üzerindeki İsim</label>
            <input type="text" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" placeholder="Ad Soyad" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">Son Kullanma</label>
              <input type="text" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" placeholder="AA/YY" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">CVC</label>
              <input type="text" value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200" placeholder="123" />
            </div>
          </div>
          {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
          <button type="button" onClick={handlePay} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold mt-2 hover:bg-green-700 transition">Ödemeyi Tamamla</button>
        </form>
        {success && (
          <div className="mt-6 text-center text-green-700 font-bold animate-bounce">Ödeme Başarılı! Yönlendiriliyorsunuz...</div>
        )}
      </div>
    </div>
  );
}
 