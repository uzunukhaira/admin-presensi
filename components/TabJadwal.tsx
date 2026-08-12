import { useState, useEffect } from 'react';

const API_URL = "http://127.0.0.1:5000/api";

export default function TabJadwal() {
  const [dataJadwal, setDataJadwal] = useState([]);
  const [formJadwal, setFormJadwal] = useState({ 
    mata_kuliah: '', jam_mulai: '', jam_selesai: '', ruangan: '' 
  });

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      const res = await fetch(`${API_URL}/jadwal`);
      const json = await res.json();
      setDataJadwal(json.data || []);
    } catch (error) {
      console.error("Gagal memuat jadwal", error);
    }
  };

  const tambahJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/admin/jadwal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formJadwal)
    });
    if (res.ok) {
      alert("Jadwal Berhasil Ditambahkan!");
      setFormJadwal({ mata_kuliah: '', jam_mulai: '', jam_selesai: '', ruangan: '' });
      fetchJadwal();
    } else {
      alert("Gagal menambahkan jadwal");
    }
  };

  const hapusJadwal = async (id: number) => {
    if(!confirm("Yakin ingin menghapus jadwal ini?")) return;
    await fetch(`${API_URL}/admin/jadwal/${id}`, { method: 'DELETE' });
    fetchJadwal();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Form Jadwal */}
      <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h3 className="font-bold text-lg mb-4">Buat Jadwal Baru</h3>
        <form onSubmit={tambahJadwal} className="space-y-4">
          <input type="text" placeholder="Mata Kuliah" required className="w-full border p-2 rounded" 
            value={formJadwal.mata_kuliah} onChange={(e) => setFormJadwal({...formJadwal, mata_kuliah: e.target.value})} />
          
          <div className="flex gap-2">
            <input type="time" required className="w-1/2 border p-2 rounded" 
              value={formJadwal.jam_mulai} onChange={(e) => setFormJadwal({...formJadwal, jam_mulai: e.target.value})} title="Jam Mulai" />
            <input type="time" required className="w-1/2 border p-2 rounded" 
              value={formJadwal.jam_selesai} onChange={(e) => setFormJadwal({...formJadwal, jam_selesai: e.target.value})} title="Jam Selesai"/>
          </div>
          
          <input type="text" placeholder="Ruangan (Misal: Gedung C 201)" required className="w-full border p-2 rounded" 
            value={formJadwal.ruangan} onChange={(e) => setFormJadwal({...formJadwal, ruangan: e.target.value})} />
            
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold">
            Tambah Jadwal
          </button>
        </form>
      </div>

      {/* Tabel Jadwal */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="p-4 border-b">Mata Kuliah</th>
              <th className="p-4 border-b">Waktu</th>
              <th className="p-4 border-b">Ruangan</th>
              <th className="p-4 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dataJadwal.length === 0 ? (
               <tr><td colSpan={4} className="p-4 text-center text-gray-500">Belum ada jadwal.</td></tr>
            ) : (
              dataJadwal.map((row: any) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{row.mata_kuliah}</td>
                  <td className="p-4">{row.jam_mulai} - {row.jam_selesai}</td>
                  <td className="p-4">{row.ruangan}</td>
                  <td className="p-4">
                    <button onClick={() => hapusJadwal(row.id)} className="text-red-500 font-bold hover:underline">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}