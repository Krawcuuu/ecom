// ecom-frontend/src/api/axiosInstance.ts

import axios from 'axios';

// Ustawienie głównego URL dla wszystkich zapytań
const API_URL = import.meta.env.VITE_API_URL; 

// 1. Utworzenie instancji Axios
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000, 
    headers: {
        'Content-Type': 'application/json',
    }
});

// 2. Dodanie interceptora (opcjonalne, ale potrzebne do tokenów Auth)
axiosInstance.interceptors.request.use(
    (config) => {
        // Pobierz token z localStorage (lub innego miejsca)
        const token = localStorage.getItem('token');
        
        if (token) {
            // Dodaj nagłówek autoryzacyjny tylko, jeśli token istnieje
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. JAWNY EKSPORT DOMYŚLNY
export default axiosInstance;