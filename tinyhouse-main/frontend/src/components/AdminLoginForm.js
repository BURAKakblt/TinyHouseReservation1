"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "sudeozdemir@gmail.com" && password === "sude") {
      alert("Admin olarak giriş başarılı!");
      router.push("/admin"); // admin sayfasına yönlendir
    } else {
      alert("E-posta veya şifre yanlış!");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6 mx-auto mt-20"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Admin Girişi</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          E-posta
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-[#CDBEAF]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Şifre</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-[#CDBEAF]"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition"
      >
        Giriş Yap
      </button>
    </form>
  );
}
