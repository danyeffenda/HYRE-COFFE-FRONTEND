import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function GerobakList() {
    const [gerobaks, setGerobaks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, nama_gerobak: '' });

    // 1. Fetch data dari API
    const fetchGerobak = async () => {
        try {
            const token = localStorage.getItem('jwt_token');
            const res = await api.get('/gerobak');
            setGerobaks(res.data.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchGerobak(); }, []);

    // 2. Handle Simpan (Tambah/Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwt_token');
        try {
            if (formData.id) {
                await axios.put(`http://127.0.0.1:8000/api/gerobak/${formData.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await api.post('http://127.0.0.1:8000/api/gerobak', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchGerobak();
            setIsModalOpen(false);
            setFormData({ id: null, nama_gerobak: '' });
        } catch (err) { alert('Gagal menyimpan data'); }
    };

    // 3. Handle Hapus
    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus gerobak ini?')) return;
        const token = localStorage.getItem('jwt_token');
        await axios.delete(`http://127.0.0.1:8000/api/gerobak/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchGerobak();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-[#2B422C]">Daftar Gerobak</h3>
                <button
                    onClick={() => { setFormData({ id: null, nama_gerobak: '' }); setIsModalOpen(true); }}
                    className="bg-[#6B8E6E] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#527055]"
                >
                    <Plus size={20} /> Tambah Gerobak
                </button>
            </div>

            {/* Tabel */}
            <div className="bg-white rounded-2xl border border-[#EAEFEA] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-[#F0F4F1] text-[#4A5D4E]">
                        <tr>
                            <th className="p-5 font-bold">Nama Gerobak</th>
                            <th className="p-5 font-bold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4F1]">
                        {gerobaks.map((g) => (
                            <tr key={g.id} className="hover:bg-gray-50">
                                <td className="p-5 font-semibold text-[#2B422C]">{g.nama_gerobak}</td>
                                <td className="p-5 flex justify-center gap-3">
                                    <button onClick={() => { setFormData(g); setIsModalOpen(true); }} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl w-full max-w-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-[#2B422C]">{formData.id ? 'Edit Gerobak' : 'Tambah Gerobak'}</h4>
                            <button type="button" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <input
                            className="w-full p-3 border-2 border-[#EAEFEA] rounded-xl mb-6"
                            placeholder="Nama Gerobak"
                            value={formData.nama_gerobak}
                            onChange={(e) => setFormData({ ...formData, nama_gerobak: e.target.value })}
                        />
                        <button type="submit" className="w-full bg-[#6B8E6E] text-white py-3 rounded-xl font-bold">Simpan</button>
                    </form>
                </div>
            )}
        </div>
    );
}