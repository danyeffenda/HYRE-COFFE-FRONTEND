import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Kata Sandi</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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