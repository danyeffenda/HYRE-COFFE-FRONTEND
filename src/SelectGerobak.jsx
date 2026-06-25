import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { Store } from 'lucide-react';
// import axios from "axios";

export default function SelectGerobak({ onSelectGerobak, onLogout }) {
    const [gerobaks, setGerobaks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGerobak = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                const response = await api.get('/gerobak', {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
        localStorage.setItem('gerobak_id', gerobakId);
        localStorage.setItem('gerobak_nama', gerobakNama);
        onSelectGerobak();
    };

    return (
        <div className="min-h-screen bg-[#F5F7F5] flex flex-col items-center p-8 lg:p-16 font-sans">
            <div className="max-w-5xl w-full">

                {/* Header Section */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-[#2B422C] mb-3 tracking-tight">Pilih Gerobak</h1>
                        <p className="text-[#8FA891] text-lg">Pilih lokasi operasional Anda untuk memulai shift hari ini.</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-6 py-3 bg-white border border-[#E2E8E4] text-[#4A5D4E] font-bold rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
                    >
                        Keluar
                    </button>
                </div>

                {/* Grid Container */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-48 bg-white rounded-3xl animate-pulse border border-[#EAEFEA]"></div>
                        ))}
                    </div>
                ) : gerobaks.length === 0 ? (
                    <div className="text-center p-20 bg-white rounded-3xl border border-[#EAEFEA]">
                        <p className="text-[#8FA891] font-medium text-xl">Belum ada gerobak yang tersedia.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {gerobaks.map((gerobak) => (
                            <div
                                key={gerobak.id}
                                onClick={() => handlePilih(gerobak.id, gerobak.nama_gerobak)}
                                className="bg-white p-8 rounded-3xl shadow-sm border-2 border-[#EAEFEA] cursor-pointer hover:border-[#6B8E6E] hover:shadow-xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center"
                            >
                                <div className="h-20 w-20 mb-6 bg-[#F0F4F1] rounded-full flex items-center justify-center text-4xl group-hover:bg-[#6B8E6E] group-hover:text-white transition-all">
                                    <Store size={40} strokeWidth={1.5} /> {/* Ukuran ikon diatur di sini */}
                                </div>
                                <h3 className="text-xl font-extrabold text-[#2B422C] mb-2 group-hover:text-[#6B8E6E]">
                                    {gerobak.nama_gerobak || 'Nama Gerobak'}
                                </h3>
                                <p className="text-[#A7B8AA] text-sm font-medium">Klik untuk masuk ke dashboard</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}