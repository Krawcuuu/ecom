import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import axiosInstance from '../api/axiosInstance'; 
import { useCart } from '../context/CartContext.tsx';
import { Link } from 'react-router-dom';

// --- 1. Definicja Typów ---

// Definicja struktury pojedynczego produktu
interface Product {
    id: number;
    title: string;
    description: string;
    price: string; 
    stock_quantity: number;
}

// Typ dla propsów CSS
interface CSSProperties {
    [key: string]: React.CSSProperties;
}


// --- 2. Główny Komponent Strony Głównej ---
const HomePage: FC = () => {
    // Stan produktów jest typowany jako tablica Product
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get<Product[]>('/products');
            
            // ZABEZPIECZENIE #1: Upewnij się, że dane są tablicą
            const productsData = Array.isArray(response.data) ? response.data : [];
            
            setProducts(productsData); 
            setLoading(false);
        } catch (err) {
            console.error("Błąd ładowania produktów:", err);
            setError('Nie udało się załadować produktów z serwera.');
            
            // ZABEZPIECZENIE #2: W przypadku błędu ustawiamy stan na pustą tablicę
            setProducts([]);
            setLoading(false);
        }
    };

    // Obsługa stanów ładowania i błędu
    if (loading) return <div>Ładowanie produktów...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const handleAddToCart = (product: Product) => {
        // Zgodnie z założeniami z poprzednich plików, dodajemy produkt z ilością 1
        addToCart({ id: product.id, title: product.title, price: product.price }, 1); 
    };

    return (
        <div style={styles.container}>
            <h2>Dostępne Produkty</h2>
            <div style={styles.productList}>
                
                {/* ZABEZPIECZENIE #3: Warunek sprawdzający, czy products jest tablicą i czy ma elementy */}
                {Array.isArray(products) && products.length > 0 ? (
                    products.map((product: Product) => (
                        <div key={product.id} style={styles.productCard}>
                            <h3>{product.title}</h3>
                            <p>{product.description.substring(0, 50)}...</p>
                            <p style={styles.price}>{parseFloat(product.price).toFixed(2)} PLN</p>
                            <p style={{ color: product.stock_quantity > 5 ? 'green' : 'orange' }}>
                                {product.stock_quantity > 0 ? `Dostępnych: ${product.stock_quantity}` : 'Brak w magazynie'}
                            </p>
                            
                            <div style={styles.actions}>
                                <Link to={`/product/${product.id}`} style={styles.detailsButton}>Szczegóły</Link>
                                
                                <button 
                                    onClick={() => handleAddToCart(product)} 
                                    disabled={product.stock_quantity === 0}
                                    style={styles.cartButton}
                                >
                                    Dodaj do koszyka
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    // Komunikat, gdy nie ma produktów (lub po błędzie, który zresetował do pustej tablicy)
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>
                        <p>Brak produktów do wyświetlenia.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 3. Style (bez zmian) ---

const styles: CSSProperties = {
    container: { padding: '20px' },
    productList: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px' 
    },
    productCard: {
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: '#333',
    },
    actions: {
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px'
    },
    detailsButton: {
        padding: '8px 12px',
        backgroundColor: '#f0f0f0',
        color: '#333',
        textDecoration: 'none',
        borderRadius: '3px',
        textAlign: 'center'
    },
    cartButton: {
        padding: '8px 12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer'
    }
};

export default HomePage;