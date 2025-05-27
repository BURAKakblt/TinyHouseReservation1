import ReservationButton from "./ReservationButton";

export default function Tenant2Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4 text-[#260B01]">
        Hoşgeldin Kiracı!
      </h1>
      <p className="text-lg text-gray-700 max-w-xl text-center mb-8">
        Burası kiracıların ana sayfasıdır. Buradan rezervasyonlarını
        yönetebilir, profilini güncelleyebilir ve daha fazlasını yapabilirsin.
      </p>

      <ReservationButton />
    </div>
  );
}
