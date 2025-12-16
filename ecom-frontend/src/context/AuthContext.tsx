// ecom-frontend/src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, FC } from 'react';
import axiosInstance from '../api/axiosInstance';

// --- 1. Definicja Typów ---

// 1.1 Typ dla danych użytkownika (MUSI BYĆ ZGODNY z tym, co wraca z API /users/profile)
interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'admin'; // Krytyczne dla AdminDashboard
    // ... inne dane, np. firstName, lastName
}

// 1.2 Typ dla całego kontekstu (co zwraca useAuth())
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null; // Użytkownik jest typu User lub null
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

// Inicjalizacja kontekstu z typem AuthContextType lub undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 2. Komponent Providera ---

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    // Stan uwierzytelnienia i danych użytkownika
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Stan ładowania początkowego

    // Ładowanie stanu przy starcie aplikacji
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Jeśli jest token, spróbuj pobrać profil
            fetchUserProfile(token);
        } else {
            setLoading(false); // Jeśli nie ma tokenu, zakończ ładowanie
        }
    }, []);

    // --- Funkcje Obsługujące Logikę ---

    // Pobieranie profilu użytkownika na podstawie tokenu
    const fetchUserProfile = async (token: string) => {
        try {
            // Dodajemy token do nagłówka dla żądania profilu
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Pobieramy dane profilu i typujemy odpowiedź
            const response = await axiosInstance.get<User>('/users/profile'); 
            
            // Ustawienie stanu po sukcesie
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Błąd pobierania profilu:", error);
            // Wyczyść niepoprawny token
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Logowanie użytkownika
    const login = async (email: string, password: string): Promise<void> => {
        try {
            // Załóżmy, że endpoint logowania zwraca { token: string }
            const response = await axiosInstance.post<{ token: string }>('/auth/login', { email, password });
            const token = response.data.token;
            
            localStorage.setItem('token', token);
            await fetchUserProfile(token); // Pobierz i ustaw dane użytkownika
        } catch (error: any) {
            // Rzuć błąd, aby LoginPage mógł go obsłużyć
            const message = error.response?.data?.message || 'Błąd logowania.';
            throw new Error(message);
        }
    };

    // Wylogowanie użytkownika
    const logout = () => {
        localStorage.removeItem('token');
        delete axiosInstance.defaults.headers.common['Authorization']; // Usuń nagłówek
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
    };

    const contextValue: AuthContextType = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
    };

    // Oczekujemy, aż stan zostanie załadowany (aby uniknąć migotania widoków)
    if (loading) {
        return <div>Sprawdzanie sesji...</div>; 
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- 3. Hook do Użycia Kontekstu (z zabezpieczeniem) ---

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth musi być użyty wewnątrz AuthProvider');
    }
    
    return context;
};