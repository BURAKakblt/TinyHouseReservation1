"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  // Tenant state'leri
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Owner state'leri
  const [ownerCompanyName, setOwnerCompanyName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  // Kullanıcı türü: "tenant" veya "owner"
  const [userType, setUserType] = useState(null);

  // Tenant için signup handler
  const handleSignupTenant = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5254/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: name,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      alert("Kayıt başarılı!");
      router.push("/login");
    } else {
      alert(data.message || "Kayıt başarısız");
    }
  };

  // Owner için signup handler
  const handleSignupOwner = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5254/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: ownerCompanyName,
        email: ownerEmail,
        password: ownerPassword,
      }),
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      alert("Kayıt başarılı!");
      router.push("/login");
    } else {
      alert(data.message || "Kayıt başarısız");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <img
        src="/Unknown-69.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-82 z-0"
      />
      <div className="bg-white p-10 rounded shadow-md flex flex-col items-center space-y-4 relative z-8 w-full max-w-md">
        <h2 className="text-3xl text-black font-bold mb-4 text-center">Kaydol</h2>

        {!userType && (
          <>
            <p className="text-center text-black mb-6">
              Lütfen kaydolmak istediğiniz türü seçin:
            </p>

            <button
              onClick={() => setUserType("tenant")}
              className="w-64 bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition mb-4"
            >
              Kiracı Olarak Kaydol
            </button>

            <button
              onClick={() => setUserType("owner")}
              className="w-64 bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition"
            >
              İlan Sahibi Olarak Kaydol
            </button>
          </>
        )}

        {userType === "tenant" && (
          <form className="w-full" onSubmit={handleSignupTenant}>
            <button
              type="button"
              onClick={() => setUserType(null)}
              className="text-sm text-black-500 hover:underline mb-4"
            >
              &larr; Geri
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">
              Kiracı Kaydı
            </h3>
            <div className="mb-4">
              <label className="block mb-1">İsim</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded"
                placeholder="Adınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded"
                placeholder="Email adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Şifre</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#260B01] text-white py-3 rounded hover:bg-[#3e2010] transition"
            >
              Kaydol
            </button>
          </form>
        )}

        {userType === "owner" && (
          <form className="w-full" onSubmit={handleSignupOwner}>
            <button
              type="button"
              onClick={() => setUserType(null)}
              className="text-sm text-black hover:underline mb-4"
            >
              &larr; Geri
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center text-black">
              İlan Sahibi Kaydı
            </h3>
            <div className="mb-4">
              <label className="block mb-1 text-black ">Firma Adı</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded"
                placeholder="Firma veya adınız"
                value={ownerCompanyName}
                onChange={(e) => setOwnerCompanyName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-black ">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded"
                placeholder="Email adresiniz"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-black ">Şifre</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded"
                placeholder="Şifreniz"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition"
            >
              Kaydol
            </button>
          </form>
        )}

        <div className="text-center text-black mt-4">
          <p className="text-sm">
            Zaten bir hesabınız var mı?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-[#260B01] cursor-pointer"
            >
              Giriş yapın
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
