"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <img
        src="/foto70.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-82 z-0"
      />
      <div className="bg-white p-12 rounded shadow-md flex flex-col items-center space-y-6 relative z-10">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Giriş Türünü Seçin
        </h1>

        <button
          onClick={() => router.push("/tenant")}
          className="w-64 bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition"
        >
          Kiracı Girişi
        </button>

        <button
          onClick={() => router.push("/owner")}
          className="w-64 bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition"
        >
          İlan Sahibi Girişi
        </button>

        <button
          onClick={() => router.push("/admin-login")}
          className="w-64 bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition"
        >
          Admin Girişi
        </button>
      </div>
    </div>
  );
}
