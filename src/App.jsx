import React, { useState, useEffect } from 'react';
import Login from './Login';
import PosDashboard from './PosDashboard';
import SelectGerobak from './SelectGerobak'; // Pastikan file SelectGerobak.jsx sudah Anda buat

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGerobakSelected, setIsGerobakSelected] = useState(false);

  // Mengecek token dan gerobak saat aplikasi baru di-refresh/dibuka
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const gerobak = localStorage.getItem('gerobak_id');

    if (token) {
      setIsAuthenticated(true);
    }
    if (gerobak) {
      setIsGerobakSelected(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // Kita tidak men-set gerobak di sini, agar aplikasi memaksa kasir masuk ke layar pilih gerobak
  };

  const handleGerobakSelected = () => {
    setIsGerobakSelected(true);
  };

  // Fungsi untuk menghapus semua memori saat kasir menekan tombol Keluar
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('kasir_id');
    localStorage.removeItem('gerobak_id');
    localStorage.removeItem('gerobak_nama');

    setIsAuthenticated(false);
    setIsGerobakSelected(false);
  };

  // 1. Jika belum login, tampilkan layar Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Jika sudah login, TAPI belum memilih gerobak
  if (isAuthenticated && !isGerobakSelected) {
    return <SelectGerobak onSelectGerobak={handleGerobakSelected} onLogout={handleLogout} />;
  }

  // 3. Jika sudah login DAN sudah memilih gerobak, masuk ke Kasir
  return <PosDashboard onLogout={handleLogout} />;
}

export default App;