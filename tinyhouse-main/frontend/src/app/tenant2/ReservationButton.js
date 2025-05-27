"use client";

export default function ReservationButton() {
  const handleClick = () => {
    alert("Henüz eklenmedi!");
  };

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 bg-[#CDBEAF] text-[#260B01] rounded font-semibold hover:bg-[#b9a999] transition"
    >
      Rezervasyonları Görüntüle
    </button>
  );
}
