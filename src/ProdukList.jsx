import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProdukList() {
    const [produks, setProduks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fungsi untuk mengambil data dari API Laravel
    const fetchProduk = async () => {
        try {
            const token = localStorage.getItem('jwt_token');

            // Panggil endpoint produk (Pastikan rutenya benar di routes/api.php)
            const response = await axios.get('http://127.0.0.1:8000/api/produk', {
                headers: {
                    Authorization: `Bearer ${token}` // Kirim token agar diizinkan masuk oleh server
                }
            });

            if (response.data.success) {
                setProduks(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching produk:", err);
            setError('Gagal memuat data produk. Pastikan server aktif.');
        } finally {
            setLoading(false);
        }
    };

    // Jalankan fungsi fetchProduk HANYA saat komponen pertama kali dimunculkan
    useEffect(() => {
        fetchProduk();
    }, []);

    // Format angka ke Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Memuat data produk...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 font-semibold bg-red-50 rounded-xl">{error}</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                            <th className="p-4 font-bold">Kode</th>
                            <th className="p-4 font-bold">Nama Produk</th>
                            <th className="p-4 font-bold">Kategori</th>
                            <th className="p-4 font-bold text-right">Harga Dasar</th>
                            <th className="p-4 font-bold text-center">Status</th>
                            <th className="p-4 font-bold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {produks.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-400">Belum ada data produk.</td>
                            </tr>
                        ) : (
                            produks.map((produk) => (
                                <tr key={produk.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-semibold text-gray-700">{produk.kode_produk}</td>
                                    <td className="p-4 text-sm font-bold text-gray-900">{produk.nama}</td>
                                    {/* Mengambil nama kategori dari relasi with('kategori') */}
                                    <td className="p-4 text-sm text-gray-600">
                                        {produk.kategori ? produk.kategori.nama : <span className="text-red-400 italic">Tanpa Kategori</span>}
                                    </td>
                                    <td className="p-4 text-sm font-semibold text-amber-600 text-right">
                                        {formatRupiah(produk.harga_dasar)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${produk.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {produk.aktif ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-center space-x-2">
                                        <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100">Edit</button>
                                        <button className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100">Hapus</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}