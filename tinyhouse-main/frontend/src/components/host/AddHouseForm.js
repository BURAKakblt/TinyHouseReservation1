export default function AddHouseForm() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Yeni Ev Ekle</h2>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Başlık"
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Açıklama"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Fiyat"
          className="w-full border p-2 rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Kaydet
        </button>
      </form>
    </div>
  );
}
