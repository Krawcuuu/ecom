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
    // Używamy Product[]
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
            
            // --- KRYTYCZNE KODY DEBUGUJĄCE DO WERYFIKACJI STRUKTURY DANYCH ---
            console.log("--- DEBUGOWANIE ODPOWIEDZI API ---");
            console.log("SUROWE DANE ODPOWIEDZI:", response.data);
            console.log("CZY response.data JEST TABLICĄ?", Array.isArray(response.data));
            console.log("-----------------------------------");
            
            // ZABEZPIECZENIE #1: Upewnij się, że dane są tablicą.
            // Jeśli backend zwraca { data: [...] } zamiast [...]
            // MUSISZ zmienić response.data na response.data.data
            // Zakładamy, że backend zwraca czystą tablicę.
            const productsData = Array.isArray(response.data) ? response.data : [];
            
            // Jeśli podejrzewasz, że dane są w zagnieżdżonym obiekcie (np. response.data.products)
            // odkomentuj poniższy wiersz:
            // const productsData = Array.isArray((response.data as any).products) ? (response.data as any).products : [];


            setProducts(productsData); 
            setLoading(false);
        } catch (err) {
            console.error("Błąd ładowania produktów (szczegóły):", err);
            setError('Nie udało się załadować produktów z serwera. Sprawdź konsolę, czy API zwraca 500 lub niepoprawny format.');
            
            // ZABEZPIECZENIE #2: W przypadku błędu ustawiamy stan na pustą tablicę
            setProducts([]);
            setLoading(false);
        }
    };

    // Obsługa stanów ładowania i błędu
    if (loading) return <div>Ładowanie produktów...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;

    const handleAddToCart = (product: Product) => {
        addToCart({ id: product.id, title: product.title, price: product.price }, 1); 
    };

    return (
        <div style={styles.container}>
            <h2>Dostępne Produkty</h2>
            <div style={styles.productList}>
                
                {/* ZABEZPIECZENIE #3 (Wcześniejsza Linia 75): Warunek przed mapowaniem */}
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
                    // Komunikat, gdy nie ma produktów (lub po niepowodzeniu ładowania)
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>
                        <p>Brak produktów do wyświetlenia.</p>
                        <p>Sprawdź konsolę, aby zweryfikować poprawność odpowiedzi z API.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 3. Style ---

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