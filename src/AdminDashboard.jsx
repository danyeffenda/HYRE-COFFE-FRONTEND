import React, { useState } from 'react';
import ProdukList from './ProdukList';
import PegawaiList from './PegawaiList';
import DashboardOverview from './DashboardOverview';
import GerobakList from './GerobakList';

export default function AdminDashboard({ onLogout }) {
    const [activeMenu, setActiveMenu] = useState('dashboard');

    const renderContent = () => {
        switch (activeMenu) {
            case 'produk':
                return <div className="animate-fade-in"><ProdukList /></div>;
            case 'pegawai':
                return <div className="animate-fade-in"><PegawaiList /></div>;
            case 'gerobak': // Case baru ditambahkan
                return <div className="animate-fade-in"><GerobakList /></div>;
            case 'dashboard':
            default:
                return <div className="animate-fade-in"><DashboardOverview /></div>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7F5] flex font-sans">
            {/* SIDEBAR NAVIGATION */}
            <div className="w-64 bg-white border-r border-[#EAEFEA] flex flex-col">
                <div className="p-8 border-b border-[#F0F4F1]">
                    <h1 className="text-2xl font-black text-[#2B422C]">Hyre Coffee</h1>
                    <p className="text-[10px] text-[#A7B8AA] mt-1 uppercase tracking-widest font-bold">Admin Panel</p>
                </div>

                <div className="flex-1 py-6">
                    <nav className="space-y-2 px-4">
                        {[
                            { id: 'dashboard', label: '📊 Ringkasan' },
                            { id: 'produk', label: '☕ Manajemen Produk' },
                            { id: 'pegawai', label: '👥 Data Pegawai' },
                            { id: 'gerobak', label: '🏪 Kelola Gerobak' } // Koma ditambahkan
                        ].map((menu) => (
                            <button
                                key={menu.id}
                                onClick={() => setActiveMenu(menu.id)}
                                className={`w-full text-left px-5 py-3.5 rounded-xl transition-all font-bold ${activeMenu === menu.id
                                    ? 'bg-[#6B8E6E] text-white shadow-md'
                                    : 'text-[#4A5D4E] hover:bg-[#F0F4F1]'
                                    }`}
                            >
                                {menu.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6 border-t border-[#F0F4F1]">
                    <button
                        onClick={onLogout}
                        className="w-full bg-[#F5F7F5] text-[#2B422C] font-bold py-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        Keluar
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white h-20 border-b border-[#EAEFEA] flex items-center justify-between px-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <h2 className="text-lg font-bold text-[#2B422C]">
                        {activeMenu === 'dashboard' ? 'Dashboard Ringkasan' :
                            activeMenu === 'produk' ? 'Manajemen Produk' :
                                activeMenu === 'pegawai' ? 'Data Pegawai' : 'Kelola Gerobak'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#6B8E6E] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-10 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}