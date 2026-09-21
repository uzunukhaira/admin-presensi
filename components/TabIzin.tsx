import { useEffect, useState } from 'react';

const API_URL = "http://127.0.0.1:5000/api";

export default function TabIzin() {
  const [dataIzin, setDataIzin] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIzin();
  }, []);

  const fetchIzin = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/izin`);
      const json = await res.json();
      if (json.status === 'success') {
        setDataIzin(json.data || []);
      }
    } catch (error) {
      console.error("Gagal memuat data izin:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Verifikasi Surat Izin / Sakit Mahasiswa</h2>
      {loading ? (
        <p>Memuat data...</p>
      ) : dataIzin.length === 0 ? (
        <p className="text-gray-500">Belum ada pengajuan izin atau sakit.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">NIM</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Mata Kuliah</th>
                <th className="p-3">Status</th>
                <th className="p-3">Waktu Pengajuan</th>
                <th className="p-3">Bukti Surat</th>
              </tr>
            </thead>
            <tbody>
              {dataIzin.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">{item.nim}</td>
                  <td className="p-3">{item.nama}</td>
                  <td className="p-3">{item.mata_kuliah}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      item.status === 'Sakit' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">{item.waktu}</td>
                  <td className="p-3">
                    {item.bukti_url ? (
                      <a 
                        href={`http://127.0.0.1:5000/${item.bukti_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 underline font-medium hover:text-blue-800"
                      >
                        Lihat Surat 📄
                      </a>
                    ) : (
                      <span className="text-gray-400">Tidak ada file</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}