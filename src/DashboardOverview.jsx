import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';

export default function DashboardOverview() {
    const [stats, setStats] = useState({
        total_produk: 0,
        total_pegawai: 0,
        transaksi_hari_ini: 0,
        pendapatan_hari_ini: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRingkasan = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                const response = await api.get('/dashboard/ringkasan', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Gagal memuat data ringkasan dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRingkasan();
    }, []);

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Memuat ringkasan bisnis...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Ringkasan Bisnis</h2>
                    <p className="text-sm text-gray-500 mt-1">Performa Hyre Coffee hari ini.</p>
                </div>
                <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold text-sm">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* KARTU STATISTIK */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Kartu Pendapatan */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl">
                        💰
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500">Pendapatan Hari Ini</p>
                        <h3 className="text-xl font-extrabold text-gray-800">{formatRupiah(stats.pendapatan_hari_ini)}</h3>
                    </div>
                </div>

                {/* Kartu Transaksi */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
                        🛒
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500">Transaksi Hari Ini</p>
                        <h3 className="text-xl font-extrabold text-gray-800">{stats.transaksi_hari_ini} <span className="text-xs font-medium text-gray-400">struk</span></h3>
                    </div>
                </div>

                {/* Kartu Produk */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-2xl">
                        ☕
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500">Total Produk Aktif</p>
                        <h3 className="text-xl font-extrabold text-gray-800">{stats.total_produk} <span className="text-xs font-medium text-gray-400">varian</span></h3>
                    </div>
                </div>

                {/* Kartu Pegawai */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
                        👥
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500">Total Pegawai</p>
                        <h3 className="text-xl font-extrabold text-gray-800">{stats.total_pegawai} <span className="text-xs font-medium text-gray-400">orang</span></h3>
                    </div>
                </div>

            </div>

            {/* AREA BANNER / INFORMASI TAMBAHAN */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-2xl p-8 text-white shadow-lg mt-8 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black mb-2">Selamat Bekerja, Admin!</h3>
                    <p className="text-amber-100 text-sm max-w-md">Pastikan untuk selalu mengecek stok produk secara berkala dan memantau kinerja kasir agar pelayanan kepada pelanggan Hyre Coffee tetap maksimal.</p>
                </div>
                <div className="text-6xl opacity-80 hidden md:block">
                    🚀
                </div>
            </div>
        </div>
    );
}