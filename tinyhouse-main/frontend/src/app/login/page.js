"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";

const roles = [
  { key: "tenant", label: "Kiracı Girişi" },
  { key: "owner", label: "İlan Sahibi Girişi" },
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("tenant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (activeTab === "tenant") {
      localStorage.setItem("email", email);
      window.location.href = "/tenant2";
      return;
    } else if (activeTab === "owner") {
      localStorage.setItem("email", email);
      window.location.href = "/owner2/dashboard";
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5254/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          role: activeTab
        })
      });
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Sunucudan geçersiz yanıt alındı");
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Giriş başarısız");
      }
      if (data.user && data.user.role) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        if (data.user.role === "tenant") {
          console.log("Kiracı yönlendirmesi çalışıyor");
          window.location.href = "/tenant2";
          return;
        } else if (data.user.role === "owner") {
          console.log("İlan sahibi yönlendirmesi çalışıyor");
          window.location.href = "/owner2/dashboard";
          return;
        } else if (data.user.role === "admin") {
          console.log("Admin yönlendirmesi çalışıyor");
          window.location.href = "/admin-panel";
          return;
        }
      } else {
        setError(data.message || "Giriş başarısız");
      }
    } catch (error) {
      setError(error.message || "Giriş yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Giriş Yap</h1>
          <button
            onClick={() => router.push("/admin/login")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Admin Girişi
          </button>
        </div>
        <div className="flex justify-center mb-6">
          {roles.map((role) => (
            <button
              key={role.key}
              onClick={() => {
                setActiveTab(role.key);
                setError("");
                setEmail("");
                setPassword("");
              }}
              className={`px-6 py-2 rounded-t-lg font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === role.key
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email adresi</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-black text-black rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ color: '#000' }}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-black text-black rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ color: '#000' }}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500 text-lg p-1"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="text-right mt-1">
                <button type="button" className="text-indigo-600 hover:underline text-sm font-medium" onClick={() => router.push('/forgot-password')}>
                  Şifremi Unuttum
                </button>
              </div>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
          <div className="text-sm text-center">
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Hesabınız yok mu? Kayıt olun
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
