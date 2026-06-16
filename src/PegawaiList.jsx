import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PegawaiList() {
    const [pegawais, setPegawais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // State untuk form yang menggabungkan data Pengguna dan Pegawai
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        kode_pegawai: '',
        jabatan: '',
        jenis_kelamin: '',
        alamat: '',
        tanggal_masuk: '',
        gaji: ''
    });

    const token = localStorage.getItem('jwt_token');

    const fetchPegawai = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/pegawai', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setPegawais(response.data.data);
            }
        } catch (err) {
            setError('Gagal memuat data pegawai.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPegawai();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddClick = () => {
        setFormData({
            nama: '', email: '', password: '', kode_pegawai: '',
            jabatan: '', jenis_kelamin: '', alamat: '', tanggal_masuk: '', gaji: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/pegawai', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setIsModalOpen(false);
                fetchPegawai();
                alert("Akun pegawai berhasil didaftarkan!");
            }
        } catch (err) {
            console.error("Error:", err.response?.data);
            const errorMsg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join('\n')
                : "Gagal menyimpan data pegawai.";
            alert("Gagal!\n" + errorMsg);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id, namaPegawai) => {
        if (window.confirm(`Yakin ingin menghapus pegawai "${namaPegawai}" beserta akses loginnya secara permanen?`)) {
            try {
                const response = await axios.delete(`http://127.0.0.1:8000/api/pegawai/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    alert("Data pegawai berhasil dihapus!");
                    fetchPegawai();
                }
            } catch (err) {
                alert("Gagal menghapus pegawai.");
            }
        }
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    const formatTanggal = (tanggal) => new Date(tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Memuat data pegawai...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-semibold bg-red-50 rounded-xl">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Pegawai</h2>
                <button
                    onClick={handleAddClick}
                    className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-md shadow-amber-200"
                >
                    + Tambah Pegawai
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-bold">Kode</th>
                                <th className="p-4 font-bold">Nama & Akun</th>
                                <th className="p-4 font-bold">Jabatan</th>
                                <th className="p-4 font-bold">Tanggal Masuk</th>
                                <th className="p-4 font-bold text-right">Gaji Pokok</th>
                                <th className="p-4 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pegawais.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Belum ada data pegawai.</td></tr>
                            ) : (
                                pegawais.map((pegawai) => (
                                    <tr key={pegawai.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm font-semibold text-gray-700">{pegawai.kode_pegawai}</td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-gray-900">{pegawai.pengguna?.nama_lengkap || '-'}</p>
                                            <p className="text-xs text-gray-500">{pegawai.pengguna?.email || '-'}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${pegawai.jabatan.toLowerCase() === 'Admin Pusat' ? 'bg-purple-100 text-purple-700' : pegawai.jabatan.toLowerCase() === 'Kasir Gerobak' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                {pegawai.jabatan}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{formatTanggal(pegawai.tanggal_masuk)}</td>
                                        <td className="p-4 text-sm font-semibold text-gray-700 text-right">{formatRupiah(pegawai.gaji)}</td>
                                        <td className="p-4 flex justify-center space-x-2">
                                            <button onClick={() => handleDelete(pegawai.id, pegawai.pengguna?.nama_lengkap)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL TAMBAH PEGAWAI */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 transform transition-all max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Registrasi Pegawai Baru</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* SECTION: DATA AKUN LOGIN */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="text-sm font-bold text-amber-600 mb-3 uppercase tracking-wider">Akses Login (Pengguna)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                                        <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Password Sementara</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required minLength="6" className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none" placeholder="Minimal 6 karakter" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: DATA OPERASIONAL */}
                            <div className="p-4 border border-gray-100 rounded-xl">
                                <h4 className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wider">Data Operasional (HRD)</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Kode Pegawai</label>
                                        <input type="text" name="kode_pegawai" value={formData.kode_pegawai} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none" placeholder="PEG-001" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Jabatan (Role)</label>
                                        <select name="jabatan" value={formData.jabatan} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none bg-white">
                                            <option value="">Pilih Jabatan...</option>
                                            <option value="Admin Pusat">Admin Pusat</option>
                                            <option value="Kasir Gerobak">Kasir Gerobak</option>
                                            <option value="Logistik Gudang">Logistik Gudang</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Masuk</label>
                                        <input type="date" name="tanggal_masuk" value={formData.tanggal_masuk} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Gaji Pokok (Rp)</label>
                                        <input type="number" name="gaji" value={formData.gaji} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none" placeholder="3000000" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Kelamin</label>
                                        <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none bg-white">
                                            <option value="">Pilih...</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                                    <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} required rows="2" className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none"></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Batal</button>
                                <button type="submit" disabled={submitLoading} className={`px-5 py-2 text-white font-bold rounded-xl shadow-lg ${submitLoading ? 'bg-amber-400 cursor-wait' : 'bg-amber-600 hover:bg-amber-700'}`}>
                                    {submitLoading ? 'Mendaftarkan...' : 'Simpan Pegawai'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}