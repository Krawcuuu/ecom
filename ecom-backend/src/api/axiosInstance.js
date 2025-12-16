// ecom-frontend/src/api/axiosInstance.js
import axios from 'axios';

// Ustawiamy bazowy URL z pliku .env
const API_URL = import.meta.env.VITE_API_URL;

// Tworzymy instancję Axios
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor (Przechwytujący) - dodawanie tokenu do każdego chronionego zapytania
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Dodajemy nagłówek Authorization: Bearer <token>
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;