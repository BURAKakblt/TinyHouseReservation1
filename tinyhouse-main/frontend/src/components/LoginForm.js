"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ userType }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Debug için istek bilgilerini logla
      const requestBody = {
        email,
        password,
        role: userType === "Kiracı" ? "tenant" : "owner"
      };
      console.log("Login isteği gönderiliyor...", requestBody);

      const response = await fetch("http://localhost:5254/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      // Debug için yanıt bilgilerini logla
      console.log("Sunucu yanıtı:", {
        status: response.status,
        statusText: response.statusText
      });

      const data = await response.json();
      console.log("Sunucu yanıt verisi:", data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Token ve kullanıcı bilgilerini kaydet
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);

      // Başarılı giriş mesajı
      alert(`${userType} olarak giriş başarılı!`);

      // Kullanıcı tipine göre yönlendirme
      const redirectPath = data.user.role === "tenant" 
        ? "/tenant2" 
        : data.user.role === "owner" 
          ? "/owner2/dashboard" 
          : "/admin-panel";

      console.log(`Yönlendirme yapılıyor: ${redirectPath}`);
      router.push(redirectPath);
    } catch (error) {
      console.error("Login hatası:", error);
      setError(error.message || "Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">{userType} Girişi</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
      <div>
          <label className="block mb-1">Email</label>
        <input
          type="email"
            className="w-full px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
            disabled={loading}
        />
      </div>
      <div>
          <label className="block mb-1">Şifre</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
              disabled={loading}
          />
          <button
            type="button"
              className="absolute right-2 top-2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
          >
            {showPassword ? "Gizle" : "Göster"}
          </button>
        </div>
        <div className="text-right mt-1">
          <button type="button" className="text-indigo-600 hover:underline text-sm font-medium" onClick={() => router.push('/forgot-password')}>
            Şifremi Unuttum
          </button>
        </div>
      </div>
      <button
        type="submit"
          className="w-full bg-[#260B01] text-white py-2 rounded hover:bg-[#3e2010] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
      >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
    </div>
  );
}
