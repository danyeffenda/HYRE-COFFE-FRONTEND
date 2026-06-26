import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function GerobakList() {
    const [gerobaks, setGerobaks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // 1. STATE FORM DIPERBARUI DENGAN KOLOM BARU
    const [formData, setFormData] = useState({
        id: null,
        kode_gerobak: '',
        nama_gerobak: '',
        lokasi_sekarang: '',
        status: 'Aktif' // Default nilai status
    });

    const fetchGerobak = async () => {
        try {
            const res = await api.get('/gerobak');
            setGerobaks(res.data.data || res.data);
        } catch (err) {
            console.error("Gagal mengambil data:", err);
        }
    };

    useEffect(() => {
        fetchGerobak();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        // 2. PAYLOAD DIPERBARUI SESUAI PERMINTAAN LARAVEL
        const payload = {
            kode_gerobak: formData.kode_gerobak,
            nama_gerobak: formData.nama_gerobak,
            lokasi_sekarang: formData.lokasi_sekarang,
            status: formData.status
        };

        try {
            if (formData.id) {
                await api.put(`/gerobak/${formData.id}`, payload);
                alert("Data gerobak berhasil diperbarui!");
            } else {
                await api.post('/gerobak', payload);
                alert("Gerobak baru berhasil ditambahkan!");
            }
            fetchGerobak();
            setIsModalOpen(false);
            // Reset state
            setFormData({ id: null, kode_gerobak: '', nama_gerobak: '', lokasi_sekarang: '', status: 'Aktif' });
        } catch (err) {
            console.error("Error validasi backend:", err.response?.data);
            const errorMsg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join('\n')
                : "Gagal menyimpan data!";
            alert("Terjadi kesalahan:\n" + errorMsg);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id, nama) => {
        if (!window.confirm(`Yakin ingin menghapus gerobak "${nama}" secara permanen?`)) return;

        try {
            await api.delete(`/gerobak/${id}`);
            alert("Gerobak berhasil dihapus!");
            fetchGerobak();
        } catch (err) {
            alert("Gagal menghapus gerobak karena masih terhubung dengan data lain.");
            console.error(err);
        }
    };

    // Handler untuk mempermudah pengetikan di banyak input sekaligus
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="space-y-6">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-[#2B422C]">Manajemen Gerobak</h3>
                <button
                    onClick={() => {
                        setFormData({ id: null, kode_gerobak: '', nama_gerobak: '', lokasi_sekarang: '', status: 'Aktif' });
                        setIsModalOpen(true);
                    }}
                    className="bg-[#6B8E6E] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#527055] transition-colors shadow-md"
                >
                    <Plus size={20} /> Tambah Gerobak
                </button>
            </div>

            {/* --- TABEL GEROBAK (DIPERBARUI DENGAN KOLOM BARU) --- */}
            <div className="bg-white rounded-2xl border border-[#EAEFEA] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-[#F0F4F1] text-[#4A5D4E] uppercase text-sm tracking-wider">
                        <tr>
                            <th className="p-5 font-bold w-24">Kode</th>
                            <th className="p-5 font-bold">Nama Cabang / Gerobak</th>
                            <th className="p-5 font-bold">Lokasi</th>
                            <th className="p-5 font-bold text-center">Status</th>
                            <th className="p-5 font-bold text-center w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4F1]">
                        {gerobaks.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-[#A7B8AA] font-medium">
                                    Belum ada data gerobak.
                                </td>
                            </tr>
                        ) : (
                            gerobaks.map((g) => (
                                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-5 text-[#4A5D4E] font-bold">{g.kode_gerobak}</td>
                                    <td className="p-5 font-black text-[#2B422C]">{g.nama_gerobak}</td>
                                    <td className="p-5 text-sm text-[#4A5D4E]">{g.lokasi_sekarang}</td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${g.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {g.status}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setFormData({
                                                        id: g.id,
                                                        kode_gerobak: g.kode_gerobak,
                                                        nama_gerobak: g.nama_gerobak,
                                                        lokasi_sekarang: g.lokasi_sekarang,
                                                        status: g.status
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(g.id, g.nama_gerobak)}
                                                className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL FORM (DIPERBESAR & DITAMBAH INPUTNYA) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">

                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#EAEFEA]">
                            <h4 className="text-xl font-black text-[#2B422C]">
                                {formData.id ? 'Edit Data Gerobak' : 'Tambah Gerobak Baru'}
                            </h4>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-[#A7B8AA] hover:text-red-500 transition-colors bg-[#F0F4F1] p-1 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-[#4A5D4E] mb-2">Kode Gerobak</label>
                                <input
                                    type="text"
                                    name="kode_gerobak"
                                    required
                                    className="w-full px-4 py-3 border-2 border-[#EAEFEA] rounded-xl focus:ring-2 focus:ring-[#6B8E6E] outline-none text-[#2B422C]"
                                    placeholder="GRB-001"
                                    value={formData.kode_gerobak}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#4A5D4E] mb-2">Status Operasional</label>
                                <select
                                    name="status"
                                    required
                                    className="w-full px-4 py-3 border-2 border-[#EAEFEA] rounded-xl focus:ring-2 focus:ring-[#6B8E6E] outline-none text-[#2B422C] bg-white"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#4A5D4E] mb-2">Nama Gerobak / Cabang</label>
                            <input
                                type="text"
                                name="nama_gerobak"
                                required
                                className="w-full px-4 py-3 border-2 border-[#EAEFEA] rounded-xl focus:ring-2 focus:ring-[#6B8E6E] outline-none text-[#2B422C]"
                                placeholder="Misal: Hyre UGM"
                                value={formData.nama_gerobak}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-[#4A5D4E] mb-2">Lokasi Sekarang</label>
                            <textarea
                                name="lokasi_sekarang"
                                required
                                rows="2"
                                className="w-full px-4 py-3 border-2 border-[#EAEFEA] rounded-xl focus:ring-2 focus:ring-[#6B8E6E] outline-none text-[#2B422C] resize-none"
                                placeholder="Alamat lengkap / Titik mangkal..."
                                value={formData.lokasi_sekarang}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 bg-[#F5F7F5] text-[#4A5D4E] py-3 rounded-xl font-bold hover:bg-[#EAEFEA] transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className={`flex-1 text-white py-3 rounded-xl font-bold transition-all shadow-md ${submitLoading ? 'bg-[#6B8E6E]/70 cursor-wait' : 'bg-[#6B8E6E] hover:bg-[#527055]'
                                    }`}
                            >
                                {submitLoading ? 'Menyimpan...' : 'Simpan Gerobak'}
                            </button>
                        </div>

                    </form>
                </div>
            )}
        </div>
    );
}