import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';

export default function ProdukList() {
    const [produks, setProduks] = useState([]);
    const [kategoris, setKategoris] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        kode_produk: '',
        nama: '',
        kategori_produk_id: '',
        harga_dasar: '',
        aktif: true
    });

    // STATE BARU KHUSUS UNTUK FOTO
    const [fileGambar, setFileGambar] = useState(null);
    const [previewGambar, setPreviewGambar] = useState(null);

    const token = localStorage.getItem('jwt_token');

    const fetchProduk = async () => {
        try {
            const response = await api.get('/produk', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setProduks(response.data.data);
            }
        } catch (err) {
            setError('Gagal memuat data produk.');
        }
    };

    const fetchKategori = async () => {
        try {
            const response = await api.get('/kategori', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setKategoris(response.data.data);
            }
        } catch (err) {
            console.error('Gagal memuat kategori', err);
        }
    };

    useEffect(() => {
        fetchProduk();
        fetchKategori();
        setLoading(false);
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // FUNGSI BARU: Menangkap file gambar dan membuat URL preview lokal
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileGambar(file);
            setPreviewGambar(URL.createObjectURL(file)); // Membuat pratinjau gambar
        }
    };

    const handleAddClick = () => {
        setIsEditMode(false);
        setEditId(null);
        setFormData({ kode_produk: '', nama: '', kategori_produk_id: '', harga_dasar: '', aktif: true });
        setFileGambar(null);
        setPreviewGambar(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (produk) => {
        setIsEditMode(true);
        setEditId(produk.id);
        setFormData({
            kode_produk: produk.kode_produk,
            nama: produk.nama,
            kategori_produk_id: produk.kategori_produk_id,
            harga_dasar: produk.harga_dasar,
            aktif: produk.aktif
        });

        // Reset file state, tapi tampilkan preview gambar lama jika ada
        setFileGambar(null);
        setPreviewGambar(produk.url_gambar ? `http://127.0.0.1:8000/storage/${produk.url_gambar}` : null);

        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const submitData = new FormData();
        submitData.append('kode_produk', formData.kode_produk);
        submitData.append('nama', formData.nama);
        submitData.append('kategori_produk_id', formData.kategori_produk_id);
        submitData.append('harga_dasar', formData.harga_dasar);
        submitData.append('aktif', formData.aktif ? 1 : 0);

        if (fileGambar) {
            submitData.append('url_gambar', fileGambar);
        }

        try {
            let response;
            if (isEditMode) {
                submitData.append('_method', 'PUT');
                response = await api.post(`/produk/${editId}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/produk', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                setIsModalOpen(false);
                fetchProduk();
                alert(isEditMode ? "Produk & Gambar berhasil diperbarui!" : "Produk & Gambar berhasil ditambahkan!");
            }
        } catch (err) {
            console.error("Error validasi:", err.response?.data);
            alert("Gagal menyimpan produk. Pastikan format gambar benar (maks 2MB).");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id, namaProduk) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${namaProduk}"? (Foto juga akan terhapus)`)) {
            try {
                const response = await api.delete(`/produk/${id}`);
                if (response.data.success) {
                    alert("Produk berhasil dihapus!");
                    fetchProduk();
                }
            } catch (err) {
                console.error("Error menghapus produk:", err);
                alert("Gagal menghapus produk. Pastikan server aktif.");
            }
        }
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Memuat data...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-semibold bg-red-50 rounded-xl">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manajemen Produk</h2>
                <button
                    onClick={handleAddClick}
                    className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-md shadow-amber-200"
                >
                    + Tambah Produk
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-bold text-center w-24">Foto</th>
                                <th className="p-4 font-bold">Kode</th>
                                <th className="p-4 font-bold">Nama Produk</th>
                                <th className="p-4 font-bold">Kategori</th>
                                <th className="p-4 font-bold text-right">Harga Dasar</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {produks.map((produk) => (
                                <tr key={produk.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 flex justify-center">
                                        {produk.url_gambar ? (
                                            <img
                                                src={`http://127.0.0.1:8000/storage/${produk.url_gambar}`}
                                                alt={produk.nama}
                                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center border border-gray-200">
                                                No Image
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm font-semibold text-gray-700">{produk.kode_produk}</td>
                                    <td className="p-4 text-sm font-bold text-gray-900">{produk.nama}</td>
                                    <td className="p-4 text-sm text-gray-600">{produk.kategori ? produk.kategori.nama : '-'}</td>
                                    <td className="p-4 text-sm font-semibold text-amber-600 text-right">{formatRupiah(produk.harga_dasar)}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${produk.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {produk.aktif ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => handleEditClick(produk)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100">Edit</button>
                                            <button onClick={() => handleDelete(produk.id, produk.nama)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 transform transition-all max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">
                                {isEditMode ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* KOLOM KIRI: Form Input Teks */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Kode Produk</label>
                                            <input type="text" name="kode_produk" value={formData.kode_produk} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none" placeholder="KOP-001" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                                            <select name="kategori_produk_id" value={formData.kategori_produk_id} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none bg-white">
                                                <option value="">Pilih Kategori...</option>
                                                {kategoris.map((kat) => (
                                                    <option key={kat.id} value={kat.id}>{kat.nama}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Produk</label>
                                        <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none" placeholder="Misal: Americano Dingin" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Harga Dasar (Rp)</label>
                                        <input type="number" name="harga_dasar" value={formData.harga_dasar} onChange={handleInputChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-amber-500 outline-none" placeholder="15000" />
                                    </div>

                                    <div className="flex items-center mt-2">
                                        <input type="checkbox" name="aktif" checked={formData.aktif} onChange={handleInputChange} className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500" />
                                        <label className="ml-2 block text-sm font-bold text-gray-700">Produk Aktif (Tersedia dijual)</label>
                                    </div>
                                </div>

                                {/* KOLOM KANAN: Upload Foto */}
                                <div className="border-l border-gray-100 pl-6 flex flex-col items-center justify-center">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 w-full text-center">Foto Produk</label>

                                    <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mb-4 overflow-hidden relative group">
                                        {previewGambar ? (
                                            <img src={previewGambar} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-sm font-medium">Belum ada foto</span>
                                        )}

                                        {/* Overlay saat di-hover */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Ganti Foto</span>
                                        </div>

                                        {/* Input file ditimpa di atas kotak (invisible) */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 text-center">Klik kotak di atas untuk unggah.<br />Format: JPG, PNG (Maks 2MB)</p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-3 border-t border-gray-100 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Batal</button>
                                <button type="submit" disabled={submitLoading} className={`px-5 py-2 text-white font-bold rounded-xl shadow-lg ${submitLoading ? 'bg-amber-400 cursor-wait' : 'bg-amber-600 hover:bg-amber-700'}`}>
                                    {submitLoading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Simpan Produk')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}