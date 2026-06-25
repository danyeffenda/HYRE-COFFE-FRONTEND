import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.API_URL || "http://127.0.0.1:8000/api", // Arahkan ke Backend
});

// Otomatis tempelkan token ke setiap request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;