"use client";
import { useState, useEffect } from 'react';
import TabPresensi from '../components/TabPresensi';
import TabMahasiswa from '../components/TabMahasiswa';
import TabJadwal from '../components/TabJadwal';
import TabTraining from '../components/TabTraining';

const API_URL = "http://127.0.0.1:5000/api";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('presensi');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const json = await res.json();
      
      if (res.ok && json.status === 'success') {
        localStorage.setItem('admin_token', json.token);
        setIsLoggedIn(true);
      } else {
        setErrorMessage(json.message || "Username atau password salah!");
      }
    } catch (error) {
      setErrorMessage("Gagal terhubung ke server backend Flask.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  // --- TAMPILAN LOGIN ADMIN ---
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-inner text-2xl">
              🛡️
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Portal</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Presensi Wajah LBPH • PNP</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Username Administrator</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">👤</span>
                <input 
                  type="text" 
                  required 
                  placeholder="Masukkan username"
                  value={loginForm.username} 
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">🔒</span>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  value={loginForm.password} 
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 text-sm disabled:opacity-50"
            >
              {isLoading ? '⏳ Memproses Autentikasi...' : 'MASUK KE DASHBOARD'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400">
              Sistem Keamanan Tugas Akhir • Hak Akses Terbatas
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --- TAMPILAN DASHBOARD UTAMA DENGAN SIDEBAR YANG DIPERBARUI ---
  return (
    <div className="min-h-screen bg-gray-100/60 flex">
      {/* SIDEBAR MODERN */}
      <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-screen p-6 shadow-2xl flex flex-col justify-between border-r border-slate-800/80">
        <div>
          {/* Header Sidebar */}
          <div className="mb-8 px-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/40">
                ⚡
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-wide text-white leading-tight">Admin LBPH</h2>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-md border border-blue-500/30 uppercase">
                  Panel Kontrol
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Politeknik Negeri Padang</p>
          </div>
          
          {/* Menu Navigasi */}
          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('presensi')} 
              className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3.5 ${
                activeTab === 'presensi' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">📊</span> Log Presensi
            </button>

            <button 
              onClick={() => setActiveTab('mahasiswa')} 
              className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3.5 ${
                activeTab === 'mahasiswa' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">🎓</span> Data Mahasiswa
            </button>

            <button 
              onClick={() => setActiveTab('jadwal')} 
              className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3.5 ${
                activeTab === 'jadwal' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">📅</span> Jadwal Kuliah
            </button>

            <button 
              onClick={() => setActiveTab('training')} 
              className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3.5 ${
                activeTab === 'training' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">🧠</span> Training LBPH
            </button>
          </nav>
        </div>

        {/* Tombol Logout di Bawah */}
        <div className="pt-4 border-t border-slate-800/80">
          <button 
            onClick={handleLogout} 
            className="w-full bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-inner"
          >
            🚪 Keluar Sistem
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 capitalize tracking-tight">
            {activeTab.replace('_', ' ')} Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola dan pantau seluruh aktivitas sistem presensi wajah secara real-time
          </p>
        </div>

        {activeTab === 'presensi' && <TabPresensi />}
        {activeTab === 'mahasiswa' && <TabMahasiswa />}
        {activeTab === 'jadwal' && <TabJadwal />}
        {activeTab === 'training' && <TabTraining />}
      </main>
    </div>
  );
}