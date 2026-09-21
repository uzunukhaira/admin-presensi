import { useState, useEffect } from 'react';

const API_URL = "http://127.0.0.1:5000/api";

export default function TabRekapKelas() {
  const [modeRekap, setModeRekap] = useState<'umum' | 'matkul'>('umum'); // 'umum' = per kelas saja, 'matkul' = per kelas + matkul
  const [dataKelas, setDataKelas] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [dataJadwalKelas, setDataJadwalKelas] = useState([]);
  const [selectedJadwalId, setSelectedJadwalId] = useState('');
  const [dataRekap, setDataRekap] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/kelas`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setDataKelas(json.data);
        setSelectedKelasId(json.data[0].id_kelas);
        fetchJadwalByKelas(json.data[0].id_kelas);
        fetchRekapData(json.data[0].id_kelas, modeRekap, '');
      }
    } catch (e) {
      console.error("Gagal memuat kelas", e);
    }
  };

  const fetchJadwalByKelas = async (idKelas: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/jadwal`);
      const json = await res.json();
      const filtered = (json.data || []).filter((j: any) => String(j.id_kelas) === String(idKelas));
      setDataJadwalKelas(filtered);
      if (filtered.length > 0) {
        setSelectedJadwalId(filtered[0].id_jadwal);
      } else {
        setSelectedJadwalId('');
      }
    } catch (e) {
      console.error("Gagal memuat jadwal", e);
    }
  };

  const fetchRekapData = async (idKelas: string, mode: 'umum' | 'matkul', idJadwal: string) => {
    if (!idKelas) return;
    setIsLoading(true);
    try {
      let endpoint = `${API_URL}/admin/rekap-tabel-umum?id_kelas=${idKelas}`;
      if (mode === 'matkul' && idJadwal) {
        endpoint = `${API_URL}/admin/rekap-tabel?id_kelas=${idKelas}&id_jadwal=${idJadwal}`;
      }
      
      const res = await fetch(endpoint);
      const json = await res.json();
      setDataRekap(json.data || []);
    } catch (e) {
      console.error("Gagal memuat rekap", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedKelasId) return;
    let url = `${API_URL}/admin/export/rekap-umum?id_kelas=${selectedKelasId}`;
    if (modeRekap === 'matkul' && selectedJadwalId) {
      url = `${API_URL}/admin/export/rekap?id_kelas=${selectedKelasId}&id_jadwal=${selectedJadwalId}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-bold text-lg text-gray-800">Rekapitulasi Kehadiran Mahasiswa</h3>
          <p className="text-xs text-gray-500">Pilih mode laporan rekapitulasi kelas atau rekapitulasi per mata kuliah</p>
        </div>

        {/* Pilihan Mode Rekap */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setModeRekap('umum');
                fetchRekapData(selectedKelasId, 'umum', '');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                modeRekap === 'umum' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rekap Per Kelas Saja
            </button>
            <button
              onClick={() => {
                setModeRekap('matkul');
                if (selectedJadwalId) fetchRekapData(selectedKelasId, 'matkul', selectedJadwalId);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                modeRekap === 'matkul' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Per Kelas + Mata Kuliah
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Navigasi Pilih Kelas */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-gray-600">Kelas:</span>
        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
          {dataKelas.map((k: any) => (
            <button
              key={k.id_kelas}
              onClick={() => {
                setSelectedKelasId(k.id_kelas);
                fetchJadwalByKelas(k.id_kelas);
                fetchRekapData(k.id_kelas, modeRekap, selectedJadwalId);
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                selectedKelasId === k.id_kelas ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {k.nama_kelas}
            </button>
          ))}
        </div>
      </div>

      {/* Jika Mode Matkul Dipilih, Tampilkan Dropdown Mata Kuliah */}
      {modeRekap === 'matkul' && (
        <div className="mb-6 flex items-center gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
          <span className="text-xs font-bold text-blue-800">Mata Kuliah:</span>
          <select
            value={selectedJadwalId}
            onChange={(e) => {
              setSelectedJadwalId(e.target.value);
              fetchRekapData(selectedKelasId, 'matkul', e.target.value);
            }}
            className="border border-gray-300 px-3 py-2 rounded-lg text-xs bg-white outline-none flex-1 max-w-md font-medium text-gray-700"
          >
            {dataJadwalKelas.map((j: any) => (
              <option key={j.id_jadwal} value={j.id_jadwal}>
                {j.nama_mk} ({j.hari} - {j.jam_mulai})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabel Utama Rekap */}
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-3.5 border-b font-semibold text-center w-14">No</th>
              <th className="p-3.5 border-b font-semibold">NIM / BP</th>
              <th className="p-3.5 border-b font-semibold">Nama Mahasiswa</th>
              <th className="p-3.5 border-b font-semibold text-center">Hadir</th>
              <th className="p-3.5 border-b font-semibold text-center">Izin</th>
              <th className="p-3.5 border-b font-semibold text-center">Sakit</th>
              <th className="p-3.5 border-b font-semibold text-center">Alpha</th>
              {modeRekap === 'matkul' && (
                <>
                  <th className="p-3.5 border-b font-semibold text-center">Total PTM</th>
                  <th className="p-3.5 border-b font-semibold text-center">Persentase</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={modeRekap === 'matkul' ? 9 : 7} className="p-10 text-center text-gray-400 text-xs">Memuat data rekap...</td>
              </tr>
            ) : dataRekap.length === 0 ? (
              <tr>
                <td colSpan={modeRekap === 'matkul' ? 9 : 7} className="p-10 text-center text-gray-400 text-xs">Tidak ada data rekap untuk kelas ini.</td>
              </tr>
            ) : (
              dataRekap.map((row: any, idx: number) => (
                <tr key={row.nim || idx} className="hover:bg-gray-50 transition">
                  <td className="p-3.5 text-center text-gray-500 text-xs">{idx + 1}</td>
                  <td className="p-3.5 font-bold text-gray-700 text-xs">{row.nim}</td>
                  <td className="p-3.5 font-medium text-gray-900 text-xs">{row.nama}</td>
                  <td className="p-3.5 text-center font-bold text-green-600 text-xs">{row.hadir || 0}</td>
                  <td className="p-3.5 text-center font-bold text-blue-600 text-xs">{row.izin || 0}</td>
                  <td className="p-3.5 text-center font-bold text-amber-600 text-xs">{row.sakit || 0}</td>
                  <td className="p-3.5 text-center font-bold text-red-600 text-xs">{row.alpha || 0}</td>
                  {modeRekap === 'matkul' && (
                    <>
                      <td className="p-3.5 text-center text-gray-600 text-xs">{row.total_pertemuan || 0}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          row.persentase >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {row.persentase}%
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}