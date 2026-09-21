import { useState, useEffect } from 'react';

const API_URL = "http://127.0.0.1:5000/api";

export default function TabJadwal() {
  const [dataJadwal, setDataJadwal] = useState([]);
  const [masterData, setMasterData] = useState({ kelas: [], dosen: [], matkul: [], ruangan: [] });
  
  // State untuk Tab Kelas yang Dipilih & Pencarian
  const [selectedKelas, setSelectedKelas] = useState('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  // State Form Tambah/Edit Jadwal
  const [formJadwal, setFormJadwal] = useState({
    id_jadwal: null,
    id_mk: '',
    id_dosen: '',
    id_kelas: '',
    id_ruangan: '',
    hari: 'Senin',
    jam_mulai: '',
    jam_selesai: '',
    tahun_akademik: '2025/2026',
    semester: 'Genap'
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchJadwal();
    fetchMasterData();
  }, []);

  const fetchJadwal = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/jadwal`);
      const json = await res.json();
      setDataJadwal(json.data || []);
    } catch (e) {
      console.error("Gagal memuat jadwal", e);
    }
  };

  const fetchMasterData = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/master-data`);
      const json = await res.json();
      setMasterData(json.data || { kelas: [], dosen: [], matkul: [], ruangan: [] });
    } catch (e) {
      console.error("Gagal memuat master data", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditMode 
      ? `${API_URL}/admin/jadwal/${formJadwal.id_jadwal}` 
      : `${API_URL}/admin/jadwal`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formJadwal)
      });
      const json = await res.json();

      if (res.ok) {
        alert(isEditMode ? "Jadwal berhasil diperbarui!" : "Jadwal berhasil ditambahkan!");
        batalEdit();
        fetchJadwal();
      } else {
        alert(`Gagal: ${json.message}`);
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleEditClick = (item: any) => {
    setIsEditMode(true);
    setFormJadwal({
      id_jadwal: item.id_jadwal,
      id_mk: item.id_mk || '',
      id_dosen: item.id_dosen || '',
      id_kelas: item.id_kelas || '',
      id_ruangan: item.id_ruangan || '',
      hari: item.hari || 'Senin',
      jam_mulai: item.jam_mulai || '',
      jam_selesai: item.jam_selesai || '',
      tahun_akademik: item.tahun_akademik || '2025/2026',
      semester: item.semester || 'Genap'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEdit = () => {
    setIsEditMode(false);
    setFormJadwal({
      id_jadwal: null,
      id_mk: '',
      id_dosen: '',
      id_kelas: '',
      id_ruangan: '',
      hari: 'Senin',
      jam_mulai: '',
      jam_selesai: '',
      tahun_akademik: '2025/2026',
      semester: 'Genap'
    });
  };

  const hapusJadwal = async (id: number) => {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/jadwal/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchJadwal();
      } else {
        alert("Gagal menghapus jadwal.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- LOGIKA FILTER BERDASARKAN TAB KELAS & SEARCH ---
  const filteredJadwal = dataJadwal.filter((item: any) => {
    const matchTabKelas = selectedKelas === 'SEMUA' || item.nama_kelas === selectedKelas;
    const matchSearch = 
      item.nama_mk?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_dosen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_ruangan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hari?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchTabKelas && matchSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredJadwal.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJadwal.length / itemsPerPage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Form Tambah / Edit Jadwal */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h3 className="font-bold text-lg mb-4 text-gray-800">
          {isEditMode ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mata Kuliah</label>
            <select 
              required 
              className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formJadwal.id_mk}
              onChange={(e) => setFormJadwal({...formJadwal, id_mk: e.target.value})}
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {masterData.matkul.map((m: any) => (
                <option key={m.id} value={m.id}>{m.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Dosen Pengampu</label>
            <select 
              required 
              className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formJadwal.id_dosen}
              onChange={(e) => setFormJadwal({...formJadwal, id_dosen: e.target.value})}
            >
              <option value="">-- Pilih Dosen --</option>
              {masterData.dosen.map((d: any) => (
                <option key={d.id} value={d.id}>{d.nama}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kelas</label>
              <select 
                required 
                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                value={formJadwal.id_kelas}
                onChange={(e) => setFormJadwal({...formJadwal, id_kelas: e.target.value})}
              >
                <option value="">-- Kelas --</option>
                {masterData.kelas.map((k: any) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Ruangan</label>
              <select 
                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                value={formJadwal.id_ruangan}
                onChange={(e) => setFormJadwal({...formJadwal, id_ruangan: e.target.value})}
              >
                <option value="">-- Ruangan --</option>
                {masterData.ruangan.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.nama}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Hari</label>
            <select 
              required 
              className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formJadwal.hari}
              onChange={(e) => setFormJadwal({...formJadwal, hari: e.target.value})}
            >
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Jam Mulai</label>
              <input type="time" required className="w-full border border-gray-300 p-2.5 rounded-lg outline-none" value={formJadwal.jam_mulai} onChange={(e) => setFormJadwal({...formJadwal, jam_mulai: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Jam Selesai</label>
              <input type="time" required className="w-full border border-gray-300 p-2.5 rounded-lg outline-none" value={formJadwal.jam_selesai} onChange={(e) => setFormJadwal({...formJadwal, jam_selesai: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold transition">
              {isEditMode ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
            </button>
            {isEditMode && (
              <button type="button" onClick={batalEdit} className="w-1/3 bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 font-bold transition">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bagian Daftar Jadwal dengan Sistem Tab Per Kelas */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Jadwal Kuliah Per Kelas</h3>
              <p className="text-xs text-gray-500">
                Menampilkan kelas: <span className="font-bold text-blue-600">{selectedKelas}</span> ({filteredJadwal.length} jadwal)
              </p>
            </div>

            {/* Kotak Pencarian Kecil */}
            <input 
              type="text" 
              placeholder="🔍 Cari MK / Dosen..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 px-3 py-2 rounded-lg text-xs outline-none w-full md:w-52"
            />
          </div>

          {/* TAB PILIHAN KELAS (Bisa di-scroll horizontal jika kelasnya banyak) */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
            <button
              onClick={() => { setSelectedKelas('SEMUA'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedKelas === 'SEMUA' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📁 Semua Kelas
            </button>
            {masterData.kelas.map((k: any) => (
              <button
                key={k.id}
                onClick={() => { setSelectedKelas(k.nama); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedKelas === k.nama 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {k.nama}
              </button>
            ))}
          </div>

          {/* Tabel Daftar Jadwal */}
          <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="p-3 border-b font-semibold">Hari / Waktu</th>
                  <th className="p-3 border-b font-semibold">Mata Kuliah</th>
                  <th className="p-3 border-b font-semibold">Dosen & Ruangan</th>
                  <th className="p-3 border-b font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">Tidak ada jadwal untuk kelas ini.</td>
                  </tr>
                ) : (
                  currentData.map((row: any) => (
                    <tr key={row.id_jadwal} className="hover:bg-gray-50 transition">
                      <td className="p-3">
                        <span className="font-bold text-blue-600 block">{row.hari}</span>
                        <span className="text-gray-500">{row.jam_mulai} - {row.jam_selesai}</span>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-gray-800">{row.nama_mk}</p>
                        <span className="text-gray-400 text-[10px]">Kelas: {row.nama_kelas}</span>
                      </td>
                      <td className="p-3">
                        <p className="text-gray-700 font-medium">{row.nama_dosen}</p>
                        <p className="text-gray-400">📍 {row.nama_ruangan}</p>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button onClick={() => handleEditClick(row)} className="text-blue-600 font-bold hover:bg-blue-50 px-2 py-1 rounded transition mr-1">
                          Edit
                        </button>
                        <button onClick={() => hapusJadwal(row.id_jadwal)} className="text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded transition">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Halaman {currentPage} dari {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold disabled:opacity-30">◀ Prev</button>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-30">Next ▶</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}