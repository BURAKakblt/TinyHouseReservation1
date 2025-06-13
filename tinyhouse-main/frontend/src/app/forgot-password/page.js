"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. E-posta gönderme
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5254/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Doğrulama kodu e-posta adresinize gönderildi.");
        setStep(2);
      } else {
        setError(data.message || "Bir hata oluştu.");
      }
    } catch (err) {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Kod doğrulama
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5254/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Kod doğrulandı. Yeni şifrenizi belirleyin.");
        setStep(3);
      } else {
        setError(data.message || "Kod yanlış veya süresi dolmuş.");
      }
    } catch (err) {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Şifre sıfırlama
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5254/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Şifreniz başarıyla değiştirildi. Giriş sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message || "Bir hata oluştu.");
      }
    } catch (err) {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Şifre Sıfırlama</h1>
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block mb-1">E-posta Adresi</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Gönderiliyor..." : "Kod Gönder"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block mb-1">E-posta Adresi</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded bg-gray-100"
                value={email}
                disabled
              />
            </div>
            <div>
              <label className="block mb-1">E-posta ile gelen Kod</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Doğrulanıyor..." : "Kodu Doğrula"}
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block mb-1">Yeni Şifre</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
            </button>
          </form>
        )}
        <div className="mt-4 text-center">
          <button className="text-indigo-600 hover:underline text-sm font-medium" onClick={() => router.push('/login')}>
            Giriş sayfasına dön
          </button>
        </div>
      </div>
    </div>
  );
} 