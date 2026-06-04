import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PosDashboard({ onLogout }) {
    // --- STATE UTAMA ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);

    // --- STATE UNTUK MODAL VARIAN ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    // --- STATE PEMBAYARAN & STRUK ---
    const [isProcessing, setIsProcessing] = useState(false);
    const [receiptData, setReceiptData] = useState(null); // Menyimpan data struk terakhir

    // 1. Ambil Data Produk Induk
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                const response = await axios.get('http://localhost:8000/api/produk', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProducts(response.data.data || response.data);
            } catch (error) {
                console.error("Gagal mengambil data produk:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // 2. Fungsi Buka Modal Varian
    const handleProductClick = async (product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
        setLoadingVariants(true);
        setVariants([]);

        try {
            const token = localStorage.getItem('jwt_token');
            const response = await axios.get('http://localhost:8000/api/varian-produk', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allVariants = response.data.data || response.data;
            const filteredVariants = allVariants.filter(v => v.produk_id === product.id);
            setVariants(filteredVariants);
        } catch (error) {
            console.error("Gagal mengambil data varian:", error);
        } finally {
            setLoadingVariants(false);
        }
    };

    // 3. Fungsi Tambah ke Keranjang
    const handleSelectVariant = (variant) => {
        const hargaSatuan = Number(currentProduct.harga_dasar) + Number(variant.harga_tambahan || 0);
        const existingItem = cart.find(item => item.varian_produk_id === variant.id);

        if (existingItem) {
            setCart(cart.map(item =>
                item.varian_produk_id === variant.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, {
                varian_produk_id: variant.id,
                nama_produk: currentProduct.nama,
                nama_varian: variant.nama_varian,
                label_ukuran: variant.label_ukuran,
                suhu: variant.suhu,
                harga_satuan: hargaSatuan,
                qty: 1
            }]);
        }
        setIsModalOpen(false);
    };

    // 4. Hitung Total Tagihan
    const totalHarga = cart.reduce((total, item) => total + (item.harga_satuan * item.qty), 0);

    // --- FUNGSI PROSES PEMBAYARAN & CETAK STRUK ---
    const handleCheckout = async () => {
        setIsProcessing(true);

        try {
            // 1. TARIK DATA DARI MEMORI BROWSER
            const token = localStorage.getItem('jwt_token');
            const kasirIdAktif = localStorage.getItem('kasir_id');
            const gerobakIdAktif = localStorage.getItem('gerobak_id');

            // Proteksi tambahan: Pastikan ID tidak kosong
            if (!kasirIdAktif || !gerobakIdAktif) {
                alert("Sesi tidak valid! KTP Kasir atau Gerobak tidak ditemukan. Silakan Logout dan Login kembali.");
                setIsProcessing(false);
                return;
            }

            // 2. RAKIT PAYLOAD SECARA DINAMIS
            const payload = {
                gerobak_id: gerobakIdAktif,  // <-- Terisi otomatis sesuai gerobak yang dipilih
                kasir_id: kasirIdAktif,      // <-- Terisi otomatis sesuai kasir yang login
                catatan: "Pesanan dari sistem POS Web",
                items: cart.map(item => ({
                    varian_produk_id: item.varian_produk_id,
                    jumlah: item.qty,
                    harga_satuan: item.harga_satuan
                }))
            };

            const response = await axios.post('http://localhost:8000/api/penjualan', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3. SIMPAN DATA KE STATE STRUK
            setReceiptData({
                nomor_transaksi: response.data.data.nomor_penjualan,
                tanggal: new Date().toLocaleString('id-ID'),
                items: [...cart],
                total: totalHarga
            });

            // 4. BUKA JENDELA PRINT
            setTimeout(() => {
                window.print();
                alert("✅ Transaksi Berhasil! Silakan cetak struk.");
                setCart([]);
                setReceiptData(null);
            }, 800);

        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Terjadi kesalahan sistem.";
            alert("❌ Gagal Memproses Pembayaran:\n" + errorMsg);
        } finally {
            setIsProcessing(false);
        }
    };
    return (
        <>
            {/* ======================================================== */}
            {/* 1. LAYAR KASIR UTAMA (AKAN DISEMBUNYIKAN SAAT MENCETAK)  */}
            {/* Perhatikan penambahan class 'print:hidden' di bawah ini */}
            {/* ======================================================== */}
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none print:hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                    <h1 className="text-2xl font-extrabold text-amber-600 tracking-tight">Hyre Coffee</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">Kasir Aktif</div>
                        <button onClick={onLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">Keluar</button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <main className="flex-1 p-6 overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Menu Produk</h2>
                        {loading ? (
                            <div className="text-center text-gray-500 font-bold mt-10">Memuat data dari server...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center mt-10 p-8 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                                <p className="text-4xl mb-3">📭</p>
                                <h3 className="text-lg font-bold text-red-600">Gagal Memuat Produk</h3>
                                <p className="text-sm text-red-500 mt-2 font-medium">Data kosong atau token kedaluwarsa.</p>
                                <p className="text-xs text-red-400 mt-1">Coba tekan tombol <b>Keluar</b> di pojok kanan atas, lalu login kembali.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {products.map((product) => (
                                    <div key={product.id} onClick={() => handleProductClick(product)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all active:scale-95">
                                        <div className="h-32 bg-amber-50 rounded-xl mb-4 flex items-center justify-center text-4xl border border-amber-100">☕</div>
                                        <h3 className="font-bold text-gray-800">{product.nama}</h3>
                                        <p className="text-gray-400 text-xs mt-0.5">Mulai dari</p>
                                        <p className="text-amber-600 font-extrabold">Rp {Number(product.harga_dasar).toLocaleString('id-ID')}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                    <aside className="w-96 bg-white shadow-2xl flex flex-col z-20">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Pesanan Saat Ini</h2>
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-lg">{cart.length} Varian</span>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <p className="text-4xl mb-2">🛒</p>
                                    <p className="text-sm">Belum ada pesanan</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">{item.nama_produk}</h4>
                                                <p className="text-xs text-amber-600 font-medium">
                                                    {item.nama_varian} {item.label_ukuran ? `(${item.label_ukuran})` : ''} {item.suhu ? `- ${item.suhu}` : ''}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">Rp {item.harga_satuan.toLocaleString('id-ID')} x {item.qty}</p>
                                            </div>
                                            <div className="font-bold text-gray-800 text-sm">
                                                Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-gray-500">Total Tagihan</span>
                                <span className="font-extrabold text-2xl text-gray-800">Rp {totalHarga.toLocaleString('id-ID')}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || isProcessing}
                                className={`w-full font-bold py-4 rounded-xl transition-colors shadow-lg ${cart.length > 0 && !isProcessing ? 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 shadow-amber-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
                            >
                                {isProcessing ? 'Memproses Transaksi...' : 'Proses Pembayaran'}
                            </button>
                        </div>
                    </aside>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full border border-gray-50 flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md uppercase tracking-wider">Pilih Varian</span>
                                    <h3 className="text-xl font-black text-gray-800 mt-1.5">{currentProduct?.nama}</h3>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-2">
                                {loadingVariants ? (
                                    <div className="text-center py-6 text-sm text-gray-500 font-medium">Memuat varian kopi...</div>
                                ) : variants.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-red-500 bg-red-50 rounded-xl p-4">⚠️ Belum ada data varian.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {variants.map((variant) => {
                                            const totalHargaVarian = Number(currentProduct.harga_dasar) + Number(variant.harga_tambahan || 0);
                                            return (
                                                <div key={variant.id} onClick={() => handleSelectVariant(variant)} className="p-4 rounded-2xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50/30 cursor-pointer transition-all flex justify-between items-center group active:scale-98">
                                                    <div>
                                                        <p className="font-bold text-gray-800 group-hover:text-amber-700">{variant.nama_varian}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{variant.label_ukuran ? `Ukuran: ${variant.label_ukuran}` : ''} {variant.suhu ? ` | Suhu: ${variant.suhu}` : ''}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-extrabold text-sm text-gray-700">Rp {totalHargaVarian.toLocaleString('id-ID')}</p>
                                                        {Number(variant.harga_tambahan) > 0 && <p className="text-[10px] text-green-600 font-bold">+Rp {Number(variant.harga_tambahan).toLocaleString('id-ID')}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* 2. AREA CETAK STRUK THERMAL (HANYA MUNCUL DI PRINTER)    */}
            {/* Perhatikan penambahan class 'hidden print:block'         */}
            {/* ======================================================== */}
            {receiptData && (
                <div className="hidden print:block w-[58mm] mx-auto text-black bg-white font-mono text-[12px] p-2">

                    {/* Header Struk */}
                    <div className="text-center mb-4">
                        <h2 className="font-extrabold text-lg uppercase tracking-widest">HYRE COFFEE</h2>
                        <p className="text-[10px]">Jl. Raya Bekasi, Jawa Barat</p>
                        <p className="text-[10px] mt-1 border-b border-dashed border-black pb-2">
                            {receiptData.tanggal} <br />
                            Trx: {receiptData.nomor_transaksi}
                        </p>
                    </div>

                    {/* Item Pesanan */}
                    <div className="mb-4">
                        {receiptData.items.map((item, index) => (
                            <div key={index} className="mb-2">
                                <p className="font-bold">{item.nama_produk}</p>
                                <div className="flex justify-between">
                                    <span>{item.qty}x @ {item.harga_satuan.toLocaleString('id-ID')}</span>
                                    <span>{(item.harga_satuan * item.qty).toLocaleString('id-ID')}</span>
                                </div>
                                <p className="text-[10px] italic">
                                    - {item.nama_varian} {item.label_ukuran} {item.suhu}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Total */}
                    <div className="border-t border-dashed border-black pt-2 mb-4">
                        <div className="flex justify-between font-bold text-sm">
                            <span>TOTAL</span>
                            <span>Rp {receiptData.total.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="text-center text-[10px] italic">
                        <p>Terima kasih atas kunjungan Anda!</p>
                        <p>Layanan Pelanggan: @hyrecoffee</p>
                    </div>
                </div>
            )}
        </>
    );
}