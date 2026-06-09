import React, { useState } from 'react';
import ProdukList from './ProdukList';

export default function AdminDashboard({ onLogout }) {
    // State untuk mengatur menu apa yang sedang aktif di layar utama
    const [activeMenu, setActiveMenu] = useState('overview');

    // Fungsi render dinamis untuk area konten utama
    const renderContent = () => {
        switch (activeMenu) {
            case 'overview':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ringkasan Bisnis</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Kartu Dummy Statistik */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500">Total Pendapatan Hari Ini</h3>
                                <p className="text-3xl font-bold text-amber-600 mt-2">Rp 0</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500">Total Transaksi</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-500">Produk Terlaris</h3>
                                <p className="text-xl font-bold text-green-600 mt-2">-</p>
                            </div>
                        </div>
                    </div>
                );
            case 'produk':
                return (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Manajemen Produk</h2>
                            <button className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-md shadow-amber-200">
                                + Tambah Produk
                            </button>
                        </div>

                        {/* PANGGIL KOMPONEN TABEL DI SINI */}
                        <ProdukList />

                    </div>
                );
            case 'pegawai':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Manajemen Pegawai</h2>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                            Modul data kasir dan logistik akan kita bangun di sini.
                        </div>
                    </div>
                );
            default:
                return <div>Pilih menu dari sidebar.</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* SIDEBAR NAVIGATION */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-extrabold text-amber-600">Hyre Coffee</h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Admin Panel</p>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-4">
                        <button
                            onClick={() => setActiveMenu('overview')}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-semibold ${activeMenu === 'overview' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            📊 Ringkasan
                        </button>
                        <button
                            onClick={() => setActiveMenu('produk')}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-semibold ${activeMenu === 'produk' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            ☕ Manajemen Produk
                        </button>
                        <button
                            onClick={() => setActiveMenu('pegawai')}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-semibold ${activeMenu === 'pegawai' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            👥 Data Pegawai
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={onLogout}
                        className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors"
                    >
                        Keluar
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col">
                {/* Header (Top Bar) */}
                <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-700">Selamat datang, Owner!</h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}