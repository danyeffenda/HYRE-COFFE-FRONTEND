import React, { useState, useEffect } from 'react';
import Login from './Login';
import PosDashboard from './PosDashboard';
import SelectGerobak from './SelectGerobak';
import AdminDashboard from './AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [isGerobakSelected, setIsGerobakSelected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('user_role');
    const gerobak = localStorage.getItem('gerobak_id');

    // Menggunakan console.log, bukan print()
    console.log("Role yang terbaca dari sistem:", userRole);

    if (token) {
      setIsAuthenticated(true);

      // Trik Aman: Kita ubah hurufnya jadi kecil semua agar tidak peduli 
      // di database tulisannya "Admin", "ADMIN", atau "admin", tetap terbaca "admin"
      setRole(userRole ? userRole.toLowerCase() : null);
    }

    if (gerobak) {
      setIsGerobakSelected(true);
    }
  }, []);

  const handleLoginSuccess = (userRole) => {
    setIsAuthenticated(true);
    // Trik aman yang sama saat baru login
    setRole(userRole ? userRole.toLowerCase() : null);
  };

  const handleGerobakSelected = () => {
    setIsGerobakSelected(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setRole(null);
    setIsGerobakSelected(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Karena di atas kita sudah memakai toLowerCase(), 
  // semua case di bawah INI WAJIB HURUF KECIL SEMUA
  switch (role) {
    case 'kasir gerobak': // Sesuaikan jika di database namanya "Kasir Gerobak"
    case 'kasir':         // Antisipasi jika namanya cuma "Kasir"
      if (!isGerobakSelected) {
        return <SelectGerobak onSelectGerobak={handleGerobakSelected} onLogout={handleLogout} />;
      }
      return <PosDashboard onLogout={handleLogout} />;

    case 'admin pusat':
    case 'admin':
    case 'owner': // Antisipasi jika di database namanya "Owner"
      // SUDAH DIAKTIFKAN: Langsung panggil komponen AdminDashboard yang baru dibuat
      return <AdminDashboard onLogout={handleLogout} />;

    case 'logistik':
    case 'gudang':
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">Dashboard Logistik & Gudang</h1>
          <p className="text-gray-500 mt-2">Selamat datang, Anda login sebagai Staf Logistik.</p>
          <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg">Keluar</button>
        </div>
      );

    default:
      return (
        <div className="p-8 text-center mt-20">
          <h1 className="text-3xl text-red-500 mb-4">⚠️</h1>
          <p className="text-red-500 font-semibold text-xl">Peran pengguna tidak dikenali sistem.</p>
          <p className="text-gray-500 mt-2">Role Anda saat ini: <span className="font-bold text-black">{role || "Kosong/Null"}</span></p>
          <button onClick={handleLogout} className="mt-6 bg-gray-800 text-white px-6 py-3 rounded-xl font-bold">Kembali ke Login</button>
        </div>
      );
  }
}

export default App;