"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
      <span>{type === 'success' ? '✔️' : '❌'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white font-bold">Kapat</button>
    </div>
  );
}

export default function EditHouse({ params }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const response = await fetch(`http://localhost:5254/api/houses/${id}`);
        if (!response.ok) {
          throw new Error('İlan bilgileri alınamadı');
        }
        const data = await response.json();
        setHouse(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHouse();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setToast({ message: '', type: '' });

    try {
      const response = await fetch(`http://localhost:5254/api/houses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(house),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const msg = data.message || 'İlan güncellenirken bir hata oluştu';
        setError(msg);
        setToast({ message: msg, type: 'error' });
        return;
      }

      setSuccess(true);
      setToast({ message: 'İlan başarıyla güncellendi!', type: 'success' });
      setTimeout(() => {
        router.push('/owner2/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.message);
      setToast({ message: error.message, type: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHouse(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/owner2/dashboard')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">İlan Düzenle</h1>

          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              İlan başarıyla güncellendi! Yönlendiriliyorsunuz...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Başlık</label>
              <input
                type="text"
                name="title"
                value={house?.title || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                name="description"
                value={house?.description || ''}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Şehir</label>
                <input
                  type="text"
                  name="city"
                  value={house?.city || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black placeholder-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ülke</label>
                <input
                  type="text"
                  name="country"
                  value={house?.country || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black placeholder-black"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Yatak Odası Sayısı</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={house?.bedrooms || ''}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black placeholder-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Banyo Sayısı</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={house?.bathrooms || ''}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black placeholder-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gece Başına Fiyat (TL)</label>
                <input
                  type="number"
                  name="pricePerNight"
                  value={house?.pricePerNight || ''}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black placeholder-black"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ev Tipi</label>
                <select
                  name="houseType"
                  value={house?.houseType || 'Tiny House'}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black placeholder-black"
                  required
                >
                  <option value="Tiny House" className="text-black">Tiny House</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Maksimum Misafir Sayısı</label>
                <input
                  type="number"
                  name="maxGuests"
                  value={house?.maxGuests || ''}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black placeholder-black"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Özellikler</label>
              <textarea
                name="features"
                value={house?.features || ''}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Konum</label>
              <input
                type="text"
                name="location"
                value={house?.location || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                placeholder="Örn: Kadıköy, İstanbul"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={house?.isAvailable || false}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                İlan Aktif
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/owner2/dashboard')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 