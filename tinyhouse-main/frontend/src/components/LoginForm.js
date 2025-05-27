"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ userType }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5254/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("email", email);
        alert(`${userType} olarak giriş başarılı!`);
        console.log("Başarılı giriş:", data);

        if (userType === "Kiracı") {
          router.push("/tenant2");
        } else if (userType === "İlan Sahibi") {
          router.push("/owner2");
        } else {
          router.push("/");
        }
      } else {
        alert(data.message || "Giriş başarısız.");
      }
    } catch (error) {
      alert("Bir hata oluştu: " + error.message);
      console.error("Login error:", error);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-center">{userType} Girişi</h2>

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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-[#CDBEAF]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-sm text-gray-600"
          >
            {showPassword ? "Gizle" : "Göster"}
          </button>
        </div>
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
