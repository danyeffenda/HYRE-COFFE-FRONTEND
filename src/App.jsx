import React, { useState } from 'react';

function App() {
  // 1. Data Dummy Produk (Nanti akan kita ganti dengan data dari Laravel API)
  const products = [
    { id: '1', name: 'Kopi Susu Aren', price: 18000, icon: '☕' },
    { id: '2', name: 'Americano Dingin', price: 15000, icon: '🧊' },
    { id: '3', name: 'Matcha Latte', price: 22000, icon: '🍵' },
    { id: '4', name: 'Roti Bakar Coklat', price: 12000, icon: '🍞' },
  ];

  // 2. State untuk menyimpan isi keranjang belanja
  const [cart, setCart] = useState([]);

  // 3. Fungsi untuk menambah produk ke keranjang
  const addToCart = (product) => {
    // Cek apakah barang sudah ada di keranjang
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      // Jika ada, tambah jumlahnya (qty)
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      // Jika belum ada, masukkan sebagai barang baru dengan qty = 1
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // 4. Hitung Total Harga secara otomatis
  const totalHarga = cart.reduce((total, item) => total + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* --- HEADER --- */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
        <h1 className="text-2xl font-extrabold text-amber-600 tracking-tight">Hyre Coffee</h1>
        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          Kasir Aktif
        </div>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <div className="flex-1 flex overflow-hidden">

        {/* KOLOM KIRI: Daftar Produk */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Menu Produk</h2>

          <div className="grid grid-cols-3 gap-4">
            {/* Melakukan perulangan (map) untuk menampilkan semua produk */}
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all active:scale-95"
              >
                <div className="h-32 bg-amber-50 rounded-xl mb-4 flex items-center justify-center text-4xl border border-amber-100">
                  {product.icon}
                </div>
                <h3 className="font-bold text-gray-800">{product.name}</h3>
                <p className="text-amber-600 font-bold mt-1">Rp {product.price.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        </main>

        {/* KOLOM KANAN: Keranjang & Pembayaran */}
        <aside className="w-96 bg-white shadow-2xl flex flex-col z-20">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Pesanan Saat Ini</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-lg">
              {cart.length} Item
            </span>
          </div>

          {/* Area List Pesanan */}
          <div className="flex-1 p-6 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-4xl mb-2">🛒</p>
                <p className="text-sm">Belum ada pesanan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500">Rp {item.price.toLocaleString('id-ID')} x {item.qty}</p>
                    </div>
                    <div className="font-bold text-gray-800">
                      Rp {(item.price * item.qty).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Area Total & Tombol Bayar */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-500">Total Tagihan</span>
              <span className="font-extrabold text-2xl text-gray-800">
                Rp {totalHarga.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              className={`w-full font-bold py-4 rounded-xl transition-colors shadow-lg ${cart.length > 0
                ? 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 shadow-amber-200'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                }`}
              disabled={cart.length === 0}
            >
              Proses Pembayaran
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default App;