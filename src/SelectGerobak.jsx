import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SelectGerobak({ onSelectGerobak, onLogout }) {
    const [gerobaks, setGerobaks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGerobak = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                // Asumsi: Anda sudah membuat API endpoint ini di Laravel
                const response = await axios.get('http://localhost:8000/api/gerobak', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Menyesuaikan dengan format respon Laravel Anda
                setGerobaks(response.data.data || response.data);
            } catch (error) {
                console.error("Gagal memuat data gerobak:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGerobak();
    }, []);

    const handlePilih = (gerobakId, gerobakNama) => {
        // Simpan ID gerobak ke memori browser
        localStorage.setItem('gerobak_id', gerobakId);
        localStorage.setItem('gerobak_nama', gerobakNama); // Opsi tambahan agar nama gerobak bisa ditampilkan

        // Pindah ke layar POS Dashboard
        onSelectGerobak();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="max-w-3xl w-full">

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-amber-600 mb-2">Buka Shift</h1>
                        <p className="text-gray-500">Pilih lokasi gerobak Anda berjaga hari ini.</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                    >
                        Batalkan & Keluar
                    </button>
                </div>

                {loading ? (
                    <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 font-bold animate-pulse">Memuat daftar gerobak...</p>
                    </div>
                ) : gerobaks.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100 text-red-500">
                        ⚠️ Belum ada data gerobak di database Supabase Anda.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {gerobaks.map((gerobak) => (
                            <div
                                key={gerobak.id}
                                onClick={() => handlePilih(gerobak.id, gerobak.nama_gerobak)}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all active:scale-95 group flex flex-col items-center text-center"
                            >
                                <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:bg-amber-100 transition-colors">
                                    🏪
                                </div>
                                {/* Sesuaikan 'nama_gerobak' dengan nama kolom di tabel Anda */}
                                <h3 className="font-extrabold text-gray-800 text-lg group-hover:text-amber-700">
                                    {gerobak.nama_gerobak || gerobak.nama || 'Nama Gerobak'}
                                </h3>
                                <p className="text-xs text-gray-400 mt-2">Ketuk untuk memilih</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}