import { useState, useEffect } from 'react';

const API_URL = "http://127.0.0.1:5000/api";

export default function TabPresensi() {
  const [dataPresensi, setDataPresensi] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk Pagination (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPresensi();
  }, []);

  const fetchPresensi = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/presensi`);
      const json = await res.json();
      setDataPresensi(json.data || []);
    } catch (error) {
      console.error("Gagal memuat data presensi", error);
    }
  };

  const filteredPresensi = dataPresensi.filter((item: any) => {
  const nim = item.nim ? String(item.nim).toLowerCase() : "";
  const nama = item.nama ? String(item.nama).toLowerCase() : "";
  const mataKuliah = item.mata_kuliah ? String(item.mata_kuliah).toLowerCase() : "";
  const query = searchQuery.toLowerCase();

    return nim.includes(query) || nama.includes(query) || mataKuliah.includes(query);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredPresensi.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPresensi.length / itemsPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
      <div>
        {/* Header & Search Bar yang Elegan */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Log Kehadiran Mahasiswa</h3>
            <p className="text-xs text-gray-500">
              Menampilkan {filteredPresensi.length} dari total {dataPresensi.length} riwayat presensi
            </p>
          </div>
          
          <div className="w-full sm:w-80">
            <input 
              type="text" 
              placeholder="🔍 Cari NIM, Nama, atau Mata Kuliah..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 px-3.5 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm"
            />
          </div>
        </div>

        {/* Kotak Tabel dengan Fixed Height & Scroll Vertical Mandiri */}
        <div className="max-h-[460px] overflow-y-auto border border-gray-100 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600 text-sm uppercase">
              <tr>
                <th className="p-3.5 border-b font-semibold text-center w-16">No</th>
                <th className="p-3.5 border-b font-semibold">NIM</th>
                <th className="p-3.5 border-b font-semibold">Nama Mahasiswa</th>
                <th className="p-3.5 border-b font-semibold">Mata Kuliah</th>
                <th className="p-3.5 border-b font-semibold text-center">Status</th>
                <th className="p-3.5 border-b font-semibold">Waktu Absen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">📂</span>
                      <span>Tidak ada riwayat presensi yang ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((row: any, index: number) => {
                  const nomorUrut = indexOfFirstItem + index + 1;
                  return (
                    <tr key={row.id || index} className="hover:bg-gray-50 transition">
                      <td className="p-3.5 text-center font-medium text-gray-500">{nomorUrut}</td>
                      <td className="p-3.5 font-bold text-gray-700">{row.nim}</td>
                      <td className="p-3.5 font-medium text-gray-900">{row.nama}</td>
                      <td className="p-3.5 text-gray-600">{row.mata_kuliah}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs inline-block
                          ${row.status === 'Hadir' ? 'bg-green-100 text-green-700' : 
                            row.status === 'Terlambat' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-sm text-gray-500 font-mono">{row.waktu}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tombol Navigasi Panah Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1} 
              className="px-3.5 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs"
            >
              ◀ Sebelumnya
            </button>
            <button 
              onClick={nextPage} 
              disabled={currentPage === totalPages} 
              className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs"
            >
              Berikutnya ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}