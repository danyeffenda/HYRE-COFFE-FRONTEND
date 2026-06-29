import React, { useState, useEffect } from 'react';
import api from '../axiosConfig';

export default function PosDashboard({ onLogout }) {
    const [products, setProducts] = useState([]);
    const [kategoris, setKategoris] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);

    // const [varian, setVarian] = useState([]);

    const [activeCategory, setActiveCategory] = useState('Semua Produk');
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [modalQty, setModalQty] = useState(1);

    // State baru untuk Varian Global dari Database
    const [globalModifiers, setGlobalModifiers] = useState({
        size: [],
        ice: [],
        sweetness: []
    });

    const [selectedOptions, setSelectedOptions] = useState({
        size: null,
        ice: null,
        sweetness: null
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    // 1. Ambil Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('jwt_token'); // Pastikan token diambil
                const headers = { Authorization: `Bearer ${token}` };

                const [resProduk, resKategori, resVarian] = await Promise.all([
                    api.get('/produk', { headers }),
                    api.get('/kategori', { headers }),
                    api.get('/varian-produk', { headers })
                ]);
                // ..

                setProducts(resProduk.data.data || resProduk.data);
                setKategoris(resKategori.data.data || resKategori.data);
                // setVarian(resVarian.data.data || resVarian.data);

                const allVariants = resVarian.data.data || resVarian.data;
                console.log(allVariants);
                const globalVars = allVariants.filter(v => v.produk_id === null && v.aktif);

                const sizes = globalVars.filter(v => v.kategori_pilihan === 'Size');
                const ices = globalVars.filter(v => v.kategori_pilihan === 'Ice');
                const sweets = globalVars.filter(v => v.kategori_pilihan === 'Sweetness');
                const variantIds = globalVars.map(v => v.id);

                setGlobalModifiers({
                    id: variantIds,
                    size: sizes,
                    ice: ices,
                    sweetness: sweets
                });

            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = products
        .filter(product => {
            const matchesCategory =
                activeCategory === "Semua Produk" ||
                (product.kategori && product.kategori.nama === activeCategory);

            const matchesSearch = product.nama
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch && product.aktif;
        })
        .sort((a, b) => {
            const dateA = a.diperbarui_pada ? new Date(a.diperbarui_pada) : new Date(0);
            const dateB = b.diperbarui_pada ? new Date(b.diperbarui_pada) : new Date(0);
            return dateB - dateA;
        });

    // 2. Klik Produk
    const handleProductClick = (product) => {
        setCurrentProduct(product);
        // Set default ke opsi pertama jika tersedia
        setSelectedOptions({
            size: globalModifiers.size[0] || null,
            ice: globalModifiers.ice[0] || null,
            sweetness: globalModifiers.sweetness[0] || null
        });
        setIsModalOpen(true);
        setModalQty(1);

        setIsModalOpen(true);
    };

    // 3. Tambah ke Keranjang
    const handleAddToCart = () => {
        const hrgSize = selectedOptions.size ? Number(selectedOptions.size.harga_tambahan) : 0;
        const hrgIce = selectedOptions.ice ? Number(selectedOptions.ice.harga_tambahan) : 0;
        const hrgSweet = selectedOptions.sweetness ? Number(selectedOptions.sweetness.harga_tambahan) : 0;

        const hargaTotalSatuan = Number(currentProduct.harga_dasar) + hrgSize + hrgIce + hrgSweet;

        const uniqueVariantId = `${currentProduct.id}-${selectedOptions.size?.id || 'ns'}-${selectedOptions.ice?.id || 'ni'}-${selectedOptions.sweetness?.id || 'nsw'}`;

        const existingItem = cart.find(item => item.cart_id === uniqueVariantId);

        if (existingItem) {
            setCart(cart.map(item =>
                item.cart_id === uniqueVariantId ? { ...item, qty: item.qty + modalQty } : item
            ));
        } else {
            setCart([...cart, {
                cart_id: uniqueVariantId,
                produk_id: currentProduct.id,
                nama_produk: currentProduct.nama,
                size: selectedOptions.size?.nama_varian || '-',
                ice: selectedOptions.ice?.nama_varian || '-',
                sweetness: selectedOptions.sweetness?.nama_varian || '-',
                harga_satuan: hargaTotalSatuan,
                qty: modalQty
            }]);
        }
        setIsModalOpen(false);
    };

    const totalHarga = cart.reduce((total, item) => total + (item.harga_satuan * item.qty), 0);
    const handleUpdateCartQty = (cart_id, change) => {
        setCart(cart.map(item => {
            if (item.cart_id === cart_id) {
                // Mencegah qty turun di bawah 1 (jika ingin hapus, gunakan tombol Hapus)
                const newQty = Math.max(1, item.qty + change);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const handleRemoveFromCart = (cart_id) => {
        setCart(cart.filter(item => item.cart_id !== cart_id));
    };

    // 4. Proses Pembayaran
    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const kasirIdAktif = localStorage.getItem('user_id');
            const gerobakIdAktif = localStorage.getItem('gerobak_id');
            console.log("kasir id:" + kasirIdAktif);
            console.log("gerobak id:" + gerobakIdAktif);

            if (!kasirIdAktif || !gerobakIdAktif) {
                alert("Sesi tidak valid! Silakan Logout dan Login kembali.");
                setIsProcessing(false);
                return;
            }
            const payload = {
                gerobak_id: gerobakIdAktif,
                kasir_id: kasirIdAktif,
                catatan: "Pesanan dari sistem POS Web",
                items: cart.map(item => ({
                    produk_id: item.produk_id,
                    jumlah: item.qty,
                    harga_satuan: item.harga_satuan,
                    // Opsional: Anda bisa mengirimkan catatan varian ke backend di sini jika tabel penjualan detail Anda mendukungnya
                    catatan_varian: `${item.size}, ${item.ice}, ${item.sweetness}`
                }))
            };
            let response;

            try {
                response = await api.post('/penjualan', payload);
            } catch (err) {
                console.log(err.response?.data);
                return;
            }

            setReceiptData({
                nomor_transaksi: response.data.data.nomor_penjualan,
                tanggal: new Date().toLocaleString('id-ID'),
                items: [...cart],
                total: totalHarga
            });

            // setReceiptData({
            //     nomor_transaksi: response.data.data.nomor_penjualan,
            //     tanggal: new Date().toLocaleString('id-ID'),
            //     items: [...cart],
            //     total: totalHarga
            // });

            setTimeout(() => {
                window.print();
                alert("✅ Transaksi Berhasil! Silakan cetak struk.");
                setCart([]);
                setReceiptData(null);
            }, 800);

        } catch (error) {
            alert("❌ Gagal Memproses Pembayaran.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-[#F5F7F5] flex flex-col font-sans select-none print:hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 border-b border-[#EAEFEA]">
                    <h1 className="text-2xl font-extrabold text-[#2B422C] tracking-tight">Hyre Coffee</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-[#4A5D4E] bg-[#F0F4F1] px-4 py-2 rounded-full">Kasir Aktif</div>
                        <button onClick={onLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">Keluar</button>
                    </div>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    <main className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col overflow-hidden">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center mb-5">
                            <p className="text-[#4A5D4E] font-medium">Temukan menu favorit untuk melengkapi aktivitasmu hari ini.</p>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full lg:w-72 border border-[#EAEFEA] rounded-full px-5 py-2 shadow-sm focus:ring-2 focus:ring-[#6B8E6E]"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row flex-1 gap-5 overflow-hidden">
                            <div className="w-full lg:w-56 bg-white rounded-2xl p-4 shadow-sm border border-[#EAEFEA] shrink-0 overflow-x-auto lg:overflow-y-auto">
                                <h3 className="text-xs font-bold text-[#A7B8AA] mb-4 uppercase tracking-widest pl-2">Kategori</h3>
                                <button
                                    onClick={() => setActiveCategory('Semua Produk')}
                                    className={`text-left px-4 py-3 rounded-xl mb-1 transition-all text-sm font-bold ${activeCategory === 'Semua Produk' ? 'bg-[#6B8E6E] text-white shadow-md' : 'text-[#4A5D4E] hover:bg-[#F0F4F1]'}`}
                                >
                                    Semua Produk
                                </button>
                                {kategoris.map(kat => (
                                    <button
                                        key={kat.id}
                                        onClick={() => setActiveCategory(kat.nama)}
                                        className={`text-left px-4 py-3 rounded-xl mb-1 transition-all text-sm font-bold ${activeCategory === kat.nama ? 'bg-[#6B8E6E] text-white shadow-md' : 'text-[#4A5D4E] hover:bg-[#F0F4F1]'}`}
                                    >
                                        {kat.nama}
                                    </button>
                                ))}
                            </div>

                            {/* PRODUK */}
                            <div className="flex-1 overflow-y-auto pb-5">
                                {loading ? (
                                    <div className="text-center mt-10">
                                        Memuat...
                                    </div>
                                ) : (
                                    <div
                                        className="grid gap-5"
                                        style={{
                                            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                                        }}
                                    >
                                        {filteredProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => handleProductClick(product)}
                                                className="bg-white rounded-3xl border border-[#EAEFEA] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                                            >
                                                {/* Gambar */}
                                                <div className="aspect-square bg-[#F7F8F7] flex items-center justify-center">
                                                    {product.url_gambar ? (
                                                        <img
                                                            src={`http://127.0.0.1:8000/storage/${product.url_gambar}`}
                                                            alt={product.nama}
                                                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="text-5xl">☕</div>
                                                    )}
                                                </div>

                                                {/* Nama Produk */}
                                                <div className="border-t border-[#F0F0F0] px-4 py-4 min-h-[80px] flex items-center justify-center">
                                                    <h3 className="text-center font-bold text-sm sm:text-base text-[#2B422C] leading-snug line-clamp-2">
                                                        {product.nama}
                                                    </h3>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                    <aside className="relative w-full lg:w-96 bg-white shadow-2xl flex flex-col h-screen border-l border-[#EAEFEA]">

                        {/* Header */}
                        <div className="p-6 border-b shrink-0 bg-white z-10">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-[#2B422C]">
                                    Pesanan Saat Ini
                                </h2>

                                <span className="bg-[#6B8E6E]/10 text-[#6B8E6E] text-xs font-bold px-2 py-1 rounded-lg">
                                    {cart.length} Item
                                </span>
                            </div>
                        </div>

                        {/* List Pesanan */}
                        <div className="flex-1 overflow-y-auto p-6 pb-56">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-[#A7B8AA]">
                                    <p className="text-4xl mb-2">🛒</p>
                                    <p className="text-sm font-medium">
                                        Belum ada pesanan
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col border-b border-[#F0F4F1] pb-3 mb-1"
                                        >
                                            {/* Nama Produk */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-[#2B422C] text-sm leading-tight">
                                                        {item.nama_produk}
                                                    </h4>

                                                    <p className="text-[10px] text-[#6B8E6E] font-medium mt-0.5">
                                                        {item.size} • {item.ice} • {item.sweetness}
                                                    </p>
                                                </div>

                                                <div className="font-bold text-[#2B422C] text-sm ml-2">
                                                    Rp {(item.harga_satuan * item.qty).toLocaleString("id-ID")}
                                                </div>
                                            </div>

                                            {/* Qty */}
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-[#A7B8AA]">
                                                    @ Rp {item.harga_satuan.toLocaleString("id-ID")}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleRemoveFromCart(item.cart_id)}
                                                        className="text-red-400 hover:text-red-600 text-xs font-bold mr-2 px-2 py-1 rounded-md hover:bg-red-50"
                                                    >
                                                        Hapus
                                                    </button>

                                                    <button
                                                        onClick={() => handleUpdateCartQty(item.cart_id, -1)}
                                                        className="w-6 h-6 rounded-md bg-[#F0F4F1] font-bold hover:bg-[#EAEFEA]"
                                                    >
                                                        -
                                                    </button>

                                                    <span className="text-xs font-black w-4 text-center">
                                                        {item.qty}
                                                    </span>

                                                    <button
                                                        onClick={() => handleUpdateCartQty(item.cart_id, 1)}
                                                        className="w-6 h-6 rounded-md bg-[#6B8E6E] text-white font-bold hover:bg-[#527055]"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Fixed */}
                        <div
                            className="
            fixed
            bottom-0
            right-0
            w-full
            lg:w-96
            bg-[#F5F7F5]
            border-t
            border-[#EAEFEA]
            p-6
            shadow-[0_-8px_20px_rgba(0,0,0,0.12)]
            z-50
        "
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-[#4A5D4E]">
                                    Total Tagihan
                                </span>

                                <span className="font-black text-2xl text-[#2B422C]">
                                    Rp {totalHarga.toLocaleString("id-ID")}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || isProcessing}
                                className={`w-full font-bold py-4 rounded-xl transition-colors shadow-lg ${cart.length > 0 && !isProcessing
                                    ? "bg-[#6B8E6E] text-white hover:bg-[#527055] active:bg-[#4A5D4E] shadow-[#6B8E6E]/30"
                                    : "bg-[#EAEFEA] text-[#A7B8AA] cursor-not-allowed shadow-none"
                                    }`}
                            >
                                {isProcessing
                                    ? "Memproses Transaksi..."
                                    : "Proses Pembayaran"}
                            </button>
                        </div>

                    </aside>
                </div>

                {isModalOpen && currentProduct && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full border border-[#EAEFEA] flex flex-col">
                            <div className="flex justify-between items-start mb-6 border-b border-[#EAEFEA] pb-4">
                                <div>
                                    <span className="text-xs font-bold text-[#6B8E6E] bg-[#6B8E6E]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Sesuaikan Pesanan</span>
                                    <h3 className="text-2xl font-black text-[#2B422C] mt-2">{currentProduct.nama}</h3>
                                    <p className="font-bold text-[#6B8E6E] mt-1">Rp {Number(currentProduct.harga_dasar).toLocaleString('id-ID')}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-[#A7B8AA] hover:text-[#4A5D4E] text-xl font-bold bg-[#F0F4F1] h-8 w-8 rounded-full flex items-center justify-center">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 pb-4">
                                {/* SIZE */}
                                {globalModifiers.size.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-[#2B422C] text-sm mb-3">Pilih Ukuran (Size)</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {globalModifiers.size.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setSelectedOptions({ ...selectedOptions, size: opt })}
                                                    className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all ${selectedOptions.size?.id === opt.id ? 'border-[#6B8E6E] bg-[#6B8E6E]/10 text-[#2B422C]' : 'border-[#EAEFEA] text-[#A7B8AA] hover:border-[#A7B8AA]'}`}
                                                >
                                                    {opt.nama_varian}
                                                    {Number(opt.harga_tambahan) > 0 && <span className="block text-[10px] text-[#6B8E6E]">+ {Number(opt.harga_tambahan) / 1000}k</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ICE */}
                                {globalModifiers.ice.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-[#2B422C] text-sm mb-3">Tingkat Es (Ice)</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {globalModifiers.ice.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setSelectedOptions({ ...selectedOptions, ice: opt })}
                                                    className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all ${selectedOptions.ice?.id === opt.id ? 'border-blue-400 bg-blue-50 text-blue-900' : 'border-[#EAEFEA] text-[#A7B8AA] hover:border-[#A7B8AA]'}`}
                                                >
                                                    {opt.nama_varian}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SWEETNESS */}
                                {globalModifiers.sweetness.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-[#2B422C] text-sm mb-3">Tingkat Gula (Sweetness)</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {globalModifiers.sweetness.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setSelectedOptions({ ...selectedOptions, sweetness: opt })}
                                                    className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all ${selectedOptions.sweetness?.id === opt.id ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-[#EAEFEA] text-[#A7B8AA] hover:border-[#A7B8AA]'}`}
                                                >
                                                    {opt.nama_varian}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-[#EAEFEA]">
                                <div className="flex justify-between items-center mb-4 px-1">
                                    <span className="font-bold text-[#2B422C] text-sm">Jumlah Pesanan</span>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                                            className="w-8 h-8 rounded-full bg-[#F0F4F1] text-[#4A5D4E] font-bold flex items-center justify-center hover:bg-[#EAEFEA] transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="font-black text-[#2B422C] w-4 text-center">{modalQty}</span>
                                        <button
                                            onClick={() => setModalQty(modalQty + 1)}
                                            className="w-8 h-8 rounded-full bg-[#6B8E6E] text-white font-bold flex items-center justify-center hover:bg-[#527055] transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-[#6B8E6E] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#527055] active:scale-95 transition-all flex justify-between px-6"
                                >
                                    <span>Tambah ke Pesanan</span>
                                    <span>
                                        {/* KALIKAN TOTAL HARGA SATUAN DENGAN QTY */}
                                        Rp {((Number(currentProduct.harga_dasar) + (selectedOptions.size ? Number(selectedOptions.size.harga_tambahan) : 0) + (selectedOptions.ice ? Number(selectedOptions.ice.harga_tambahan) : 0) + (selectedOptions.sweetness ? Number(selectedOptions.sweetness.harga_tambahan) : 0)) * modalQty).toLocaleString('id-ID')}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AREA CETAK STRUK THERMAL */}
            {receiptData && (
                <div className="hidden print:block w-[58mm] mx-auto text-black bg-white font-mono text-[12px] p-2">
                    <div className="text-center mb-4">
                        <h2 className="font-extrabold text-lg uppercase tracking-widest">HYRE COFFEE</h2>
                        <p className="text-[10px]">Jl. Raya Bekasi, Jawa Barat</p>
                        <p className="text-[10px] mt-1 border-b border-dashed border-black pb-2">
                            {receiptData.tanggal} <br />
                            Trx: {receiptData.nomor_transaksi}
                        </p>
                    </div>

                    <div className="mb-4">
                        {receiptData.items.map((item, index) => (
                            <div key={index} className="mb-2">
                                <p className="font-bold">{item.nama_produk}</p>
                                <div className="flex justify-between">
                                    <span>{item.qty}x @ {item.harga_satuan.toLocaleString('id-ID')}</span>
                                    <span>{(item.harga_satuan * item.qty).toLocaleString('id-ID')}</span>
                                </div>
                                <p className="text-[10px] italic">
                                    - {item.size}, {item.ice}, {item.sweetness}
                                </p>
                            </div>
                        ))}
                    </div>

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