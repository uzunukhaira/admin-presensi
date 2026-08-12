import { useState } from 'react';

const API_URL = "http://127.0.0.1:5000/api";

export default function TabTraining() {
  const [isLoading, setIsLoading] = useState(false);

  const triggerTraining = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/train`);
      const json = await res.json();
      
      if (res.ok) {
        alert("Training Berhasil: " + json.message);
      } else {
        alert("Training Gagal: " + json.message);
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan saat melatih model.");
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Latih Ulang Model Wajah (LBPH)</h2>
      
      <p className="text-gray-600 mb-8 leading-relaxed">
        Tombol ini berfungsi untuk melatih ulang (Re-train) algoritma LBPH menggunakan seluruh dataset wajah mahasiswa yang ada di server. 
        <br/><br/>
        <strong className="text-red-600">PENTING:</strong> Wajib ditekan setiap kali ada mahasiswa baru yang mendaftarkan wajahnya melalui aplikasi mobile, agar wajah mereka dikenali saat presensi.
      </p>
      
      <button 
        onClick={triggerTraining} 
        disabled={isLoading}
        className={`px-8 py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-transform transform hover:scale-105 
          ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
        {isLoading ? '⚙️ SEDANG MELATIH MODEL (MOHON TUNGGU)...' : '🚀 MULAI TRAINING MODEL LBPH'}
      </button>
    </div>
  );
}