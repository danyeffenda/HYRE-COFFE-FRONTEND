import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Memanggil API backend Laravel
            const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
                email: email,
                password: password
            });

            console.log("Respon dari Server:", response.data);

            if (response.data.success) {
                const token = response.data.data.token;
                const userId = response.data.data.user.id;
                // Menangkap nama_peran berbentuk teks bersih ('kasir', 'admin', 'logistik')
                const userRole = response.data.data.user.nama_peran;

                console.log("role", userRole);

                // Menyimpan data kredensial ke Local Storage
                localStorage.setItem('jwt_token', token);
                localStorage.setItem('user_id', userId);
                localStorage.setItem('user_role', userRole);

                // Memicu perubahan layar di App.jsx berdasarkan peran pengguna
                onLoginSuccess(userRole);
            } else {
                setError('Respons gagal dari server.');
            }
        } catch (err) {
            console.error("ERROR LENGKAP:", err);
            alert("PESAN DARI SERVER: " + JSON.stringify(err.response?.data || err.message));
            // Menangkap pesan error dari backend jika ada, jika tidak gunakan pesan default
            setError(err.response?.data?.message || 'Gagal login. Periksa kembali email dan password Anda.');
        } finally {
            // Mematikan status loading indikator tombol
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-amber-600">Hyre Coffee</h1>
                    <p className="text-gray-500 mt-2">Sistem Autentikasi Satu Pintu</p>
                </div>

                {/* Menampilkan pesan error jika login gagal */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Pengguna</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="nama@hyrecoffee.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Kata Sandi
                        </label>

                        {/* BUNGKUS DENGAN DIV RELATIVE */}
                        <div className="relative">
                            <input
                                // 1. Tipe input berubah secara dinamis
                                type={showPassword ? "text" : "password"}

                                // (Pertahankan props Anda yang lain seperti value, onChange, dll di sini)
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}

                                // 2. Tambahkan pr-10 (padding right) agar teks tidak tertimpa icon
                                className="w-full px-4 py-2 border border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                                placeholder="Masukkan kata sandi"
                            />

                            {/* TOMBOL ICON MATA */}
                            <button
                                type="button" // PENTING: agar form tidak tersubmit saat mengklik mata
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-amber-600 focus:outline-none"
                            >
                                {showPassword ? (
                                    // Icon Mata Dicoret (Sembunyikan) - format SVG
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    // Icon Mata Terbuka (Lihat) - format SVG
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold py-3 rounded-xl transition-colors shadow-lg ${loading
                            ? 'bg-amber-400 text-white cursor-wait'
                            : 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 shadow-amber-200'
                            }`}
                    >
                        {loading ? 'Memverifikasi...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
}