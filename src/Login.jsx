import React, { useState } from 'react';
import api from '../axiosConfig';
import logoHyre from './assets/logo-hyre.svg';
import bgImage from './assets/background hyre.webp';
import axios from "axios";

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: email,
                password: password
            });

            if (response.data.success) {
                const token = response.data.data.token;
                const userId = response.data.data.user.id;
                const userRole = response.data.data.user.nama_peran;

                localStorage.setItem('jwt_token', token);
                localStorage.setItem('user_id', userId);
                localStorage.setItem('user_role', userRole);

                onLoginSuccess(userRole);
            } else {
                setError('Respons gagal dari server.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal login. Periksa kembali kredensial Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex font-sans bg-white">
            {/* BAGIAN KIRI: Gambar Latar */}
            <div className="hidden lg:flex lg:w-1/2 relative items-end p-16">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#142315] via-[#142315]/60 to-transparent"></div>
                <div className="relative z-10 text-white max-w-lg mb-10">
                    <h1 className="text-5xl font-bold mb-4 leading-tight">Hyre Sistem</h1>
                    <p className="text-lg text-[#D1E2D3] font-medium leading-relaxed">
                        Akses semua informasi operasional, kelola pesanan,
                        dan pantau penjualan dengan mudah dan cepat.
                    </p>
                </div>
            </div>

            {/* BAGIAN KANAN: Form Login (Diperbesar untuk Proporsional) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 xl:p-24 bg-white">
                {/* max-w-xl memberikan lebar yang lebih proporsional */}
                <div className="max-w-xl w-full bg-white p-2 sm:p-6">

                    <div className="flex items-center gap-5 mb-14">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center shrink-0 mb-4 bg-[#F0F4F1] border border-[#EAEFEA] p-2">
                            <img src={logoHyre} alt="Logo Hyre Coffee" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-[#2B422C] tracking-tight uppercase">Hyre Coffee</h2>
                            <p className="text-[#8FA891] font-semibold text-base mt-1">Racikan Terbaik untuk Momen Terbaik.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 border border-red-100 p-4 rounded-xl text-base mb-8 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div>
                            <label className="block text-base font-bold text-[#4A5D4E] mb-3">Username / Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-[#A7B8AA]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                {/* text-lg dan py-4.5 membuat input lebih kokoh */}
                                <input
                                    type="email"
                                    className="w-full pl-14 pr-5 py-4.5 rounded-xl border-2 border-[#E2E8E4] bg-white focus:ring-2 focus:ring-[#6B8E6E] focus:border-[#6B8E6E] text-[#2B422C] text-lg outline-none transition-all placeholder-[#A7B8AA]"
                                    placeholder="Masukan Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-bold text-[#4A5D4E] mb-3">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-[#A7B8AA]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-14 py-4.5 rounded-xl border-2 border-[#E2E8E4] bg-white focus:ring-2 focus:ring-[#6B8E6E] focus:border-[#6B8E6E] text-[#2B422C] text-lg outline-none transition-all placeholder-[#A7B8AA] tracking-widest"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-5 text-[#A7B8AA] hover:text-[#6B8E6E] focus:outline-none transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-base mt-2 mb-8">
                            <label className="flex items-center font-semibold text-[#4A5D4E] cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mr-3 w-5 h-5 rounded border-[#E2E8E4] text-[#6B8E6E] focus:ring-[#6B8E6E] cursor-pointer"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Ingat saya
                            </label>
                            <a href="#" className="font-bold text-[#6B8E6E] hover:text-[#4A5D4E] transition-colors">
                                Lupa Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-extrabold py-4.5 rounded-xl text-lg transition-all shadow-md ${loading
                                ? 'bg-[#6B8E6E]/70 text-white cursor-wait'
                                : 'bg-[#6B8E6E] text-white hover:bg-[#527055] hover:shadow-xl active:scale-[0.99]'
                                }`}
                        >
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}