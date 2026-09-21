import { useState, useEffect, useRef } from 'react';

const API_URL = "http://127.0.0.1:5000/api";

export default function TabMahasiswa() {
  const [dataMahasiswa, setDataMahasiswa] = useState([]);
  const [dataKelas, setDataKelas] = useState([]); 
  
  // State untuk Tab Kelas yang Dipilih & Pencarian
  const [selectedKelas, setSelectedKelas] = useState('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formMhs, setFormMhs] = useState({ nim: '', nama: '', password: '', id_kelas: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingNim, setUploadingNim] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMahasiswa();
    fetchKelas();
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

  const fetchKelas = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/kelas`);
      const json = await res.json();
      setDataKelas(json.data || []);
    } catch (e) {
      console.error("Gagal memuat kelas", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nim', formMhs.nim);
    formData.append('nama', formMhs.nama);
    formData.append('id_kelas', formMhs.id_kelas);
    
    if (formMhs.password) {
      formData.append('password', formMhs.password);
    }

    const url = isEditMode 
      ? `${API_URL}/admin/mahasiswa/${formMhs.nim}` 
      : `${API_URL}/register-akun`;
      
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method: method, body: formData });
      if (res.ok) {
        alert(isEditMode ? "Data Mahasiswa Berhasil Diperbarui!" : "Mahasiswa Berhasil Ditambahkan!");
        batalEdit();
        fetchMahasiswa();
      } else {
        const json = await res.json();
        alert(`Gagal: ${json.message}`);
      }
    } catch (e) {
      alert("Terjadi kesalahan server saat menyimpan data.");
    }
  };

  const handleEditClick = (mhs: any) => {
    setIsEditMode(true);
    setFormMhs({
      nim: mhs.nim,
      nama: mhs.nama,
      password: '',
      id_kelas: mhs.id_kelas || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEdit = () => {
    setIsEditMode(false);
    setFormMhs({ nim: '', nama: '', password: '', id_kelas: '' });
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
      const res = await fetch(`${API_URL}/register-wajah`, { method: 'POST', body: formData });
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

  // --- LOGIKA FILTER BERDASARKAN TAB KELAS & SEARCH ---
  const filteredMahasiswa = dataMahasiswa.filter((mhs: any) => {
    const matchTabKelas = selectedKelas === 'SEMUA' || mhs.nama_kelas === selectedKelas;
    const matchSearch = 
      mhs.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mhs.nama.toLowerCase().includes(searchQuery.toLowerCase());

    return matchTabKelas && matchSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredMahasiswa.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMahasiswa.length / itemsPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {/* Form Tambah/Edit Mahasiswa */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h3 className="font-bold text-lg mb-4 text-gray-800">
          {isEditMode ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">NIM Mahasiswa</label>
            <input 
              type="number" 
              placeholder="NIM" 
              required 
              disabled={isEditMode}
              className={`w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${isEditMode ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} 
              value={formMhs.nim} 
              onChange={(e) => setFormMhs({...formMhs, nim: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap</label>
            <input type="text" placeholder="Nama Lengkap" required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={formMhs.nama} onChange={(e) => setFormMhs({...formMhs, nama: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Kelas</label>
            <select 
              required 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              value={formMhs.id_kelas}
              onChange={(e) => setFormMhs({...formMhs, id_kelas: e.target.value})}
            >
              <option value="" disabled>-- Pilih Kelas --</option>
              {dataKelas.map((kelas: any) => (
                <option key={kelas.id_kelas} value={kelas.id_kelas}>
                  {kelas.nama_kelas}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Password {isEditMode && <span className="text-orange-500">(Kosongkan jika tidak diubah)</span>}
            </label>
            <input 
              type="password" 
              placeholder="Password Akun" 
              required={!isEditMode}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              value={formMhs.password} 
              onChange={(e) => setFormMhs({...formMhs, password: e.target.value})} 
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold transition">
              {isEditMode ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
            {isEditMode && (
              <button type="button" onClick={batalEdit} className="w-1/3 bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 font-bold transition">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Tabel Mahasiswa dengan Tab Kelas */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Data Mahasiswa Per Kelas</h3>
              <p className="text-xs text-gray-500">
                Menampilkan kelas: <span className="font-bold text-blue-600">{selectedKelas}</span> ({filteredMahasiswa.length} mahasiswa)
              </p>
            </div>
            
            <div className="w-full md:w-64">
              <input 
                type="text" 
                placeholder="🔍 Cari NIM atau Nama..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full border border-gray-300 px-3.5 py-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* TAB PILIHAN KELAS (Bisa digeser horizontal jika kelasnya banyak) */}
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
            {dataKelas.map((k: any) => (
              <button
                key={k.id_kelas}
                onClick={() => { setSelectedKelas(k.nama_kelas); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedKelas === k.nama_kelas 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {k.nama_kelas}
              </button>
            ))}
          </div>

          {isUploading && (
            <div className="mb-4 text-center">
              <span className="text-sm bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full animate-pulse">
                ⏳ Memproses Wajah...
              </span>
            </div>
          )}
          
          <div className="max-h-[380px] overflow-y-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="p-3 border-b font-semibold text-center w-12">No</th>
                  <th className="p-3 border-b font-semibold">NIM</th>
                  <th className="p-3 border-b font-semibold">Nama & Kelas</th>
                  <th className="p-3 border-b font-semibold text-center">Wajah</th>
                  <th className="p-3 border-b font-semibold text-center">Dataset</th>
                  <th className="p-3 border-b font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">Mahasiswa tidak ditemukan.</td>
                  </tr>
                ) : (
                  currentData.map((row: any, index: number) => {
                    const nomorUrut = indexOfFirstItem + index + 1;
                    return (
                      <tr key={row.nim} className="hover:bg-gray-50 transition">
                        <td className="p-3 text-center font-medium text-gray-500">{nomorUrut}</td>
                        <td className="p-3 font-bold text-gray-700">{row.nim}</td>
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{row.nama}</p>
                          <p className="text-[10px] text-gray-500">{row.nama_kelas || 'Belum Ada Kelas'}</p>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${row.wajah_terdaftar ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {row.wajah_terdaftar ? '✅ Ya' : '❌ Belum'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => triggerUpload(row.nim)}
                            disabled={isUploading}
                            className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded text-[11px] font-semibold hover:bg-indigo-600 hover:text-white transition disabled:opacity-50"
                          >
                            📸 Tambah
                          </button>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button onClick={() => handleEditClick(row)} className="text-blue-600 font-bold hover:bg-blue-50 px-2 py-1 rounded transition mr-1">
                            Edit
                          </button>
                          <button onClick={() => hapusMahasiswa(row.nim)} className="text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded transition">
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

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Halaman {currentPage} dari {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold disabled:opacity-30">◀ Prev</button>
              <button onClick={nextPage} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-30">Next ▶</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}