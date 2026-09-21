import { useState, useEffect } from 'react';

const API_URL = "http://127.0.0.1:5000/api";

export default function TabPresensi() {
  const [dataPresensi, setDataPresensi] = useState([]);
  const [dataKelas, setDataKelas] = useState([]);
  const [dataJadwal, setDataJadwal] = useState([]); // Diperlukan untuk opsi jadwal export
  
  // State untuk Filter & Pencarian
  const [selectedKelas, setSelectedKelas] = useState('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState('SEMUA');
  const [selectedJadwalExport, setSelectedJadwalExport] = useState(''); // State khusus export
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // State untuk Pagination (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPresensi();
    fetchKelas();
    fetchJadwalAdmin();
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

  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/kelas`);
      const json = await res.json();
      setDataKelas(json.data || []);
    } catch (e) {
      console.error("Gagal memuat kelas", e);
    }
  };

  // Mengambil daftar jadwal untuk keperluan dropdown pilihan export
  const fetchJadwalAdmin = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/jadwal`);
      const json = await res.json();
      setDataJadwal(json.data || []);
    } catch (e) {
      console.error("Gagal memuat jadwal", e);
    }
  };

  const handleExportRekap = async () => {
    // Validasi: Cek apakah user sudah memilih Mata Kuliah / Jadwal
    if (!selectedJadwalExport) {
      alert("Silakan pilih Mata Kuliah / Jadwal terlebih dahulu untuk mengekspor rekap!");
      return;
    }

    // Cari tahu id_kelas berdasarkan id_jadwal yang dipilih dari dropdown
    const jadwalTerpilih: any = dataJadwal.find((j: any) => String(j.id_jadwal) === String(selectedJadwalExport));
    
    if (!jadwalTerpilih) {
      alert("Jadwal tidak valid.");
      return;
    }

    // Ambil id_kelas secara otomatis dari data jadwal yang dipilih
    // (Pastikan objek jadwal dari backend membawa 'id_kelas' atau kita cocokan dengan nama kelasnya)
    const namaKelasJadwal = jadwalTerpilih.nama_kelas;
    const kelasObj: any = dataKelas.find((k: any) => k.nama_kelas === namaKelasJadwal);

    if (!kelasObj) {
      alert("ID Kelas tidak ditemukan untuk jadwal ini.");
      return;
    }

    setIsExporting(true);
    try {
      const exportUrl = `${API_URL}/admin/export/rekap?id_kelas=${kelasObj.id_kelas}&id_jadwal=${selectedJadwalExport}`;
      
      // Buka URL export di tab baru agar browser otomatis mendownload file CSV-nya
      window.open(exportUrl, '_blank');
    } catch (error) {
      console.error("Gagal mengunduh rekap", error);
      alert("Terjadi kesalahan saat mengunduh rekap.");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredPresensi = dataPresensi.filter((item: any) => {
    const nim = item.nim ? String(item.nim).toLowerCase() : "";
    const nama = item.nama ? String(item.nama).toLowerCase() : "";
    const mataKuliah = item.mata_kuliah ? String(item.mata_kuliah).toLowerCase() : "";
    const namaKelas = item.nama_kelas ? String(item.nama_kelas) : "";
    const status = item.status ? String(item.status) : "";
    
    const query = searchQuery.toLowerCase();

    const matchSearch = nim.includes(query) || nama.includes(query) || mataKuliah.includes(query);
    const matchKelas = selectedKelas === 'SEMUA' || namaKelas === selectedKelas;
    const matchStatus = selectedStatus === 'SEMUA' || status === selectedStatus;

    return matchSearch && matchKelas && matchStatus;
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
        {/* Header & Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Log Kehadiran Mahasiswa</h3>
            <p className="text-xs text-gray-500">
              Menampilkan {filteredPresensi.length} dari total {dataPresensi.length} riwayat presensi
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {/* Filter Status */}
            <select 
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 px-3 py-2.5 rounded-lg text-xs bg-white outline-none"
            >
              <option value="SEMUA">⚡ Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Alpha">Alpha</option>
            </select>

            {/* Filter Kelas */}
            <select 
              value={selectedKelas}
              onChange={(e) => { setSelectedKelas(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 px-3 py-2.5 rounded-lg text-xs bg-white outline-none"
            >
              <option value="SEMUA">📁 Semua Kelas</option>
              {dataKelas.map((k: any) => (
                <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>
              ))}
            </select>

            {/* Search Bar */}
            <div className="w-full sm:w-50">
              <input 
                type="text" 
                placeholder="🔍 Cari NIM, Nama, MK..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full border border-gray-300 px-3.5 py-2.5 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* --- TOMBOL & PILIHAN EXPORT REKAP PER KELAS --- */}
        <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-blue-800 font-medium">
            💡 <span className="font-bold">Export Rekap Nilai:</span> Pilih kelas dan mata kuliah di bawah untuk mengunduh laporan rekapitulasi presensi.
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Dropdown pilih jadwal spesifik untuk export */}
            <select
              value={selectedJadwalExport}
              onChange={(e) => setSelectedJadwalExport(e.target.value)}
              className="border border-blue-200 bg-white px-3 py-2 rounded-lg text-xs outline-none flex-1 sm:w-60"
            >
              <option value="">-- Pilih Mata Kuliah (Jadwal) --</option>
              {dataJadwal.map((j: any) => (
                <option key={j.id_jadwal} value={j.id_jadwal}>
                  {j.nama_kelas} - {j.nama_mk} ({j.hari})
                </option>
              ))}
            </select>

            {/* Tombol Eksekusi Download */}
            <button
              onClick={handleExportRekap}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>📥</span>
              <span>{isExporting ? 'Mengunduh...' : 'Download Rekap (CSV)'}</span>
            </button>
          </div>
        </div>

        {/* Kotak Tabel dengan Fixed Height & Scroll Vertical Mandiri */}
        <div className="max-h-[420px] overflow-y-auto border border-gray-100 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600 text-xs uppercase">
              <tr>
                <th className="p-3.5 border-b font-semibold text-center w-14">No</th>
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
                      <td className="p-3.5 text-center font-medium text-gray-500 text-xs">{nomorUrut}</td>
                      <td className="p-3.5 font-bold text-gray-700 text-xs">{row.nim}</td>
                      <td className="p-3.5 font-medium text-gray-900 text-xs">{row.nama}</td>
                      <td className="p-3.5 text-gray-600 text-xs">{row.mata_kuliah}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs inline-block
                          ${row.status === 'Hadir' ? 'bg-green-100 text-green-700' : 
                            row.status === 'Terlambat' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-gray-500 font-mono">{row.waktu}</td>
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
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ◀ Sebelumnya
            </button>
            <button 
              onClick={nextPage} 
              disabled={currentPage === totalPages} 
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Berikutnya ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}