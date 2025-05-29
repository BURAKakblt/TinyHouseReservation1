"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ userType }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5254/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data;
    if (!response.ok) {
      const text = await response.text();
      alert("Sunucu hatası: " + text);
      return;
    }
    data = await response.json();
    localStorage.setItem("email", email); // Giriş bilgisini kaydet
    if (userType === "İlan Sahibi") {
      localStorage.setItem("role", "owner");
      router.push("/owner/dashboard");
    } else if (userType === "Kiracı") {
      localStorage.setItem("role", "tenant");
      router.push("/tenant2");
    } else if (userType === "Admin") {
      localStorage.setItem("role", "admin");
      router.push("/admin-panel");
    }
    alert(`${userType} olarak giriş başarılı!`);
  };

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center">{userType} Girişi</h2>

      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1">Şifre</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-900 transition"
      >
        Giriş Yap
      </button>
    </form>
  );
}
