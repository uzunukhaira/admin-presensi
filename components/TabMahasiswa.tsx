import { useState, useEffect, useRef } from 'react';

const API_URL = "http://127.0.0.1:5000/api";

export default function TabMahasiswa() {
  const [dataMahasiswa, setDataMahasiswa] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State untuk kata kunci pencarian
  const [formMhs, setFormMhs] = useState({ nim: '', nama: '', password: '' });
  
  // State untuk Upload Foto
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingNim, setUploadingNim] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State untuk Pagination (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  const fetchMahasiswa = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/mahasiswa`);
      const json = await res.json();
      setDataMahasiswa(json.data || []);
    } catch (e) {
      console.error("Gagal memuat mahasiswa", e);
    }
  };

  const tambahMahasiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nim', formMhs.nim);
    formData.append('nama', formMhs.nama);
    formData.append('password', formMhs.password);

    const res = await fetch(`${API_URL}/register-akun`, { method: 'POST', body: formData });
    if (res.ok) {
      alert("Mahasiswa Berhasil Ditambahkan!");
      setFormMhs({ nim: '', nama: '', password: '' });
      fetchMahasiswa();
    }
  };

  const hapusMahasiswa = async (nim: string) => {
    if(!confirm(`Yakin ingin menghapus NIM ${nim}?`)) return;
    await fetch(`${API_URL}/admin/mahasiswa/${nim}`, { method: 'DELETE' });
    fetchMahasiswa();
  };

  const triggerUpload = (nim: string) => {
    setUploadingNim(nim);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadingNim) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('nim', uploadingNim);
    formData.append('is_admin', 'true'); 
    
    for (let i = 0; i < files.length; i++) {
      formData.append('foto', files[i]);
    }

    try {
      const res = await fetch(`${API_URL}/register-wajah`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      
      if (res.ok) {
        alert(`Berhasil! ${json.message}`);
        fetchMahasiswa();
      } else {
        alert(`Gagal memproses foto: ${json.message}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat mengirim file ke server.");
    }

    setIsUploading(false);
    setUploadingNim(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  // --- LOGIKA FILTER PENCARIAN & PAGINATION ---
  const filteredMahasiswa = dataMahasiswa.filter((mhs: any) => 
    mhs.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mhs.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredMahasiswa.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMahasiswa.length / itemsPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Input File Tersembunyi */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Form Tambah Mahasiswa */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h3 className="font-bold text-lg mb-4 text-gray-800">Tambah Mahasiswa Baru</h3>
        <form onSubmit={tambahMahasiswa} className="space-y-4">
          <input type="number" placeholder="NIM" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formMhs.nim} onChange={(e) => setFormMhs({...formMhs, nim: e.target.value})} />
          <input type="text" placeholder="Nama Lengkap" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formMhs.nama} onChange={(e) => setFormMhs({...formMhs, nama: e.target.value})} />
          <input type="password" placeholder="Password Akun" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formMhs.password} onChange={(e) => setFormMhs({...formMhs, password: e.target.value})} />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold transition">Simpan Data</button>
        </form>
      </div>
      
      {/* Tabel Mahasiswa dengan Search, Scroll Mandiri & Pagination */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div>
          {/* Header & Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Data Mahasiswa Terdaftar</h3>
              <p className="text-xs text-gray-500">
                Ditemukan {filteredMahasiswa.length} dari total {dataMahasiswa.length} mahasiswa
              </p>
            </div>
            
            {/* Input Search */}
            <div className="w-full sm:w-72">
              <input 
                type="text" 
                placeholder="🔍 Cari NIM atau Nama..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full border border-gray-300 px-3.5 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {isUploading && (
            <div className="mb-4 text-center">
              <span className="text-sm bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full animate-pulse">
                ⏳ Memproses Wajah...
              </span>
            </div>
          )}
          
          {/* Kotak Tabel dengan Fixed Height & Scroll Vertical Mandiri */}
          <div className="max-h-[420px] overflow-y-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-3.5 border-b font-semibold text-center w-16">No</th>
                  <th className="p-3.5 border-b font-semibold">NIM</th>
                  <th className="p-3.5 border-b font-semibold">Nama Lengkap</th>
                  <th className="p-3.5 border-b font-semibold text-center">Wajah</th>
                  <th className="p-3.5 border-b font-semibold text-center">Dataset</th>
                  <th className="p-3.5 border-b font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Mahasiswa tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentData.map((row: any, index: number) => {
                    const nomorUrut = indexOfFirstItem + index + 1;
                    return (
                      <tr key={row.nim} className="hover:bg-gray-50 transition">
                        <td className="p-3.5 text-center font-medium text-gray-500">{nomorUrut}</td>
                        <td className="p-3.5 font-bold text-gray-700">{row.nim}</td>
                        <td className="p-3.5 font-medium text-gray-900">{row.nama}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${row.wajah_terdaftar ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {row.wajah_terdaftar ? '✅ Ya' : '❌ Belum'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button 
                            onClick={() => triggerUpload(row.nim)}
                            disabled={isUploading}
                            className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1 rounded-md text-xs font-semibold hover:bg-indigo-600 hover:text-white transition disabled:opacity-50 shadow-2xs"
                          >
                            📸 Tambah
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          <button onClick={() => hapusMahasiswa(row.nim)} className="text-red-500 font-bold text-xs hover:bg-red-50 px-2.5 py-1 rounded transition">
                            Hapus
                          </button>
                        </td>
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

    </div>
  );
}