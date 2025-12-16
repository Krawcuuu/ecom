import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Poprawa błędu 1: Dodano Link
import { useAuth } from '../context/AuthContext.tsx';
import axiosInstance from '../api/axiosInstance';

// --- 1. Definicja Typów ---

// Typ dla podstawowej statystyki (np. zamówienia, produkty)
interface Stats {
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
}

// Typ dla propsów CSS, włączając style dla listy
interface CSSProperties {
    [key: string]: React.CSSProperties | object; // Używamy 'object' dla zagnieżdżonych stylów
}


const AdminDashboard: FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Sprawdzenie ról: Zakładamy, że user ma pole 'role'
    // UWAGA: Typ 'user' z useAuth musi zawierać pole 'role'
    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        // Jeśli jest zalogowany, ale nie jest adminem, przekieruj
        if (!isAdmin) {
            setError('Brak uprawnień. Tylko administratorzy mają dostęp do tego panelu.');
            setLoading(false);
            // Opcjonalne: setTimeout(() => navigate('/'), 3000);
            return;
        }
        
        fetchAdminStats();
    }, [isAuthenticated, isAdmin, navigate]);

    const fetchAdminStats = async () => {
        try {
            // Chroniony endpoint dostępny tylko dla Adminów
            const response = await axiosInstance.get<Stats>('/admin/stats'); 
            setStats(response.data);
            setLoading(false);
        } catch (err) {
            setError('Błąd ładowania danych administracyjnych.');
            setLoading(false);
        }
    };

    if (loading) return <div>Ładowanie panelu administratora...</div>;
    
    // Jeśli nie jest adminem i się wczytało
    if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;

    if (!stats) return <div>Brak danych panelu.</div>;

    return (
        <div style={styles.container}>
            <h2>Panel Administratora</h2>
            {/* Pole 'user' jest opcjonalne, więc używamy operatora opcjonalnego łańcucha '?' */}
            <p>Witaj, {user?.username}!</p> 

            <div style={styles.statsGrid}>
                <div style={styles.card}>
                    <h3>Łączna Liczba Produktów</h3>
                    <p style={styles.statValue}>{stats.totalProducts}</p>
                </div>
                <div style={styles.card}>
                    <h3>Wszystkie Zamówienia</h3>
                    <p style={styles.statValue}>{stats.totalOrders}</p>
                </div>
                <div style={styles.card}>
                    <h3>Oczekujące Zamówienia</h3>
                    <p style={styles.statValue}>{stats.pendingOrders}</p>
                </div>
            </div>

            {/* Miejsce na linki do zarządzania: */}
            <h3 style={{ marginTop: '30px' }}>Zarządzanie:</h3>
            <ul style={styles.managementList}>
                {/* Linia 83: Poprawiony błąd braku Link */}
                <li><Link to="/admin/products">Zarządzaj Produktami</Link></li> 
                {/* Linia 84: Poprawiony błąd braku Link */}
                <li><Link to="/admin/orders">Zarządzaj Zamówieniami</Link></li> 
            </ul>
        </div>
    );
};

// Lokalny styl
const styles: CSSProperties = {
    container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
    statsGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
    },
    card: {
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
    },
    statValue: {
        fontSize: '2em',
        fontWeight: 'bold',
        color: '#007bff'
    },
    managementList: {
        listStyle: 'none',
        padding: 0,
        // Linia 114: Poprawiony błąd. Usunięto zagnieżdżenie CSS w stylu React.
        // Zagnieżdżone selektory CSS jak '& li' nie są obsługiwane przez inline style React.
        // Jeśli chcesz dodać styl do 'li', musisz użyć zewnętrznego pliku CSS/CSS-in-JS.
        // Dla zachowania funkcjonalności i prostoty usunięto błędny selektor.
    }
};

export default AdminDashboard;