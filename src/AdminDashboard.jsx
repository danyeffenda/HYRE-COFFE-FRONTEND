import React, { useState } from 'react';
import ProdukList from './ProdukList';
import PegawaiList from './PegawaiList';
import DashboardOverview from './DashboardOverview';
import GerobakList from './GerobakList';
import { LayoutDashboard, Coffee, Users, Store } from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
    const [activeMenu, setActiveMenu] = useState('dashboard');

    const menuItems = [
        { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
        { id: 'produk', label: 'Manajemen Produk', icon: Coffee },
        { id: 'pegawai', label: 'Data Pegawai', icon: Users },
        { id: 'gerobak', label: 'Kelola Gerobak', icon: Store }
    ];

    const renderContent = () => {
        switch (activeMenu) {
            case 'produk':
                return <div className="animate-fade-in"><ProdukList /></div>;
            case 'pegawai':
                return <div className="animate-fade-in"><PegawaiList /></div>;
            case 'gerobak':
                return <div className="animate-fade-in"><GerobakList /></div>;
            case 'dashboard':
            default:
                return <div className="animate-fade-in"><DashboardOverview /></div>;
        }
    };

    return (
        // 1. KUNCI TINGGI LAYAR DI SINI (h-screen overflow-hidden)
        <div className="h-screen overflow-hidden bg-[#F5F7F5] flex font-sans">

            {/* SIDEBAR NAVIGATION */}
            <div className="w-64 bg-white border-r border-[#EAEFEA] flex flex-col shrink-0">
                <div className="p-8 border-b border-[#F0F4F1]">
                    <h1 className="text-2xl font-black text-[#2B422C]">Hyre Coffee</h1>
                    <p className="text-[10px] text-[#A7B8AA] mt-1 uppercase tracking-widest font-bold">Admin Panel</p>
                </div>

                <div className="flex-1 py-6 overflow-y-auto">
                    <nav className="space-y-2 px-4">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveMenu(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeMenu === item.id
                                            ? 'bg-[#6B8E6E] text-white shadow-md'
                                            : 'text-[#4A5D4E] hover:bg-[#F0F4F1]'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 border-t border-[#F0F4F1] shrink-0">
                    <button
                        onClick={onLogout}
                        className="w-full bg-[#F5F7F5] text-[#2B422C] font-bold py-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        Keluar
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* 2. HEADER TERKUNCI DENGAN shrink-0 */}
                <header className="shrink-0 bg-white h-20 border-b border-[#EAEFEA] flex items-center justify-between px-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
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

                {/* AREA TENGAH BISA DI-SCROLL */}
                <main className="flex-1 p-10 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}