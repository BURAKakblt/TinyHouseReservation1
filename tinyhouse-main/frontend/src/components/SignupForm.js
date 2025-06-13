import { useState } from "react";
import { useRouter } from "next/navigation";

const roles = [
  { key: "tenant", label: "Kiracı Olarak Kaydol" },
  { key: "owner", label: "İlan Sahibi Olarak Kaydol" },
];

export default function SignupForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastName, setLastName] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      let body;
      if (activeTab === "tenant") {
        body = {
          username: name,
          lastName: lastName,
          email,
          password,
          role: "tenant",
        };
      } else {
        body = {
          username: company,
          lastName: lastName,
          email,
          password,
          role: "owner",
        };
      }
      const response = await fetch("http://localhost:5254/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(data.message || "Kayıt başarısız");
      }
    } catch (err) {
      setError("Sunucuya bağlanırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-center mb-6">
        {roles.map((role) => (
          <button
            key={role.key}
            onClick={() => {
              setActiveTab(role.key);
              setError("");
              setSuccess("");
              setName("");
              setCompany("");
              setEmail("");
              setPassword("");
              setLastName("");
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
      <form className="space-y-6" onSubmit={handleSignup}>
        {activeTab === "tenant" ? (
          <>
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">Kiracı Kaydı</h3>
            <div>
              <label className="block mb-1 text-gray-700">İsim</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded placeholder-gray-400 text-gray-900"
                placeholder="Adınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-700">Soyad</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded placeholder-gray-400 text-gray-900"
                placeholder="Soyadınız"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">İlan Sahibi Kaydı</h3>
            <div>
              <label className="block mb-1 text-gray-700">Firma Adı</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded placeholder-gray-400 text-gray-900"
                placeholder="Firma veya adınız"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-700">Soyad</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded placeholder-gray-400 text-gray-900"
                placeholder="Soyadınız"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </>
        )}
        <div>
          <label className="block mb-1 text-gray-700">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded placeholder-gray-400 text-gray-900"
            placeholder="Email adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">Şifre</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded placeholder-gray-400 text-gray-900"
            placeholder="Şifreniz"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? "Kaydolunuyor..." : "Kaydol"}
          </button>
        </div>
      </form>
    </div>
  );
} 