import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.API_URL || "http://api.effendaproject.my.id/api", // Arahkan ke Backend
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