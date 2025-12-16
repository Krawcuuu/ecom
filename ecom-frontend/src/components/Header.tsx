// ecom-frontend/src/components/Header.tsx

import React from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

const Header: FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();

    // Obliczanie całkowitej ilości przedmiotów w koszyku
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={styles.header}>
            <div style={styles.logo}>
                <Link to="/" style={styles.link}>E-Commerce TS</Link>
            </div>
            <nav style={styles.nav}>
                <Link to="/" style={styles.link}>Sklep</Link>
                
                <Link to="/cart" style={styles.cartLink}>
                    Koszyk ({totalItems})
                </Link>
                
                {isAuthenticated ? (
                    <>
                        {/* Link do historii zamówień */}
                        <Link to="/orders" style={styles.link}>Zamówienia</Link>

                        {/* Link do panelu admina (jeśli rola to 'admin') */}
                        {user?.role === 'admin' && (
                            <Link to="/admin" style={styles.adminLink}>Panel Admina</Link>
                        )}
                        
                        {/* Link do profilu */}
                        <Link to="/profile" style={styles.link}>
                            Witaj, {user?.username}
                        </Link>
                        
                        <button onClick={handleLogout} style={styles.button}>
                            Wyloguj
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Zaloguj</Link>
                        <Link to="/register" style={styles.link}>Zarejestruj</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

// Lokalny styl
const styles: { [key: string]: React.CSSProperties } = {
    header: {
        backgroundColor: '#333',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    logo: {
        fontSize: '1.5em',
        fontWeight: 'bold',
    },
    nav: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        padding: '5px 10px',
    },
    cartLink: {
        color: 'yellow',
        textDecoration: 'none',
        padding: '5px 10px',
        fontWeight: 'bold',
    },
    adminLink: {
        color: '#76b900',
        textDecoration: 'none',
        padding: '5px 10px',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
    }
};

export default Header;