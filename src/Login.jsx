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
            // Pastikan backend Laravel Anda berjalan di localhost:8000
            const response = await axios.post('http://localhost:8000/api/auth/login', {
                email: email,
                password: password
            });

            console.log("Respon dari Server:", response.data);

            // Menyimpan token ke penyimpanan browser (Local Storage)
            const token = response.data.data.token;
            const kasirId = response.data.data.user.id; // Menangkap UUID kasir dari Laravel

            localStorage.setItem('jwt_token', token);
            localStorage.setItem('kasir_id', kasirId); // Menyimpan KTP kasir ke memori

            // Memicu perubahan layar ke PosDashboard
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal login. Periksa kembali email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-amber-600">Hyre Coffee</h1>
                    <p className="text-gray-500 mt-2">Masuk ke Sistem Kasir</p>
                </div>

                {/* Menampilkan pesan error jika login gagal */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="kasir@hyrecoffee.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
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