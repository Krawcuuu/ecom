// ecom-frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Używamy naszej instancji z tokenem

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    // 1. POBIERANIE PRODUKTÓW
    const fetchProducts = async () => {
        try {
            // Używamy publicznego endpointu GET /api/products
            const response = await axiosInstance.get('/products');
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Błąd ładowania produktów. Sprawdź, czy jesteś zalogowany jako Admin.');
            setLoading(false);
        }
    };

    // 2. USUWANIE PRODUKTU (CRUD - DELETE)
    const handleDelete = async (productId) => {
        if (!window.confirm("Czy na pewno chcesz usunąć ten produkt?")) {
            return;
        }

        try {
            // Używamy chronionego endpointu DELETE /api/products/:id
            await axiosInstance.delete(`/products/${productId}`);
            
            // Odświeżenie listy po usunięciu
            fetchProducts();
        } catch (err) {
            setError('Błąd podczas usuwania produktu. Wymagane uprawnienia admina.');
        }
    };

    if (loading) return <div>Ładowanie danych...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Panel Administracyjny - Zarządzanie Produktami</h2>
            <ProductForm fetchProducts={fetchProducts} /> {/* Formularz dodawania/edycji */}
            
            <hr />
            
            <h3>Lista Produktów (Aktualny Stan Magazynowy)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={tableHeaderStyle}>ID</th>
                        <th style={tableHeaderStyle}>Tytuł</th>
                        <th style={tableHeaderStyle}>Cena</th>
                        <th style={tableHeaderStyle}>Stan Magazynu</th>
                        <th style={tableHeaderStyle}>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.title}</td>
                            <td>{product.price} PLN</td>
                            <td style={{ fontWeight: 'bold' }}>{product.stock_quantity} szt.</td>
                            <td>
                                {/* Przycisk Edycji (do zaimplementowania logiki edycji) */}
                                <button disabled>Edytuj</button> 
                                <button 
                                    onClick={() => handleDelete(product.id)} 
                                    style={{ marginLeft: '10px', color: 'red' }}
                                >
                                    Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Podstawowe style tabeli
const tableHeaderStyle = { 
    borderBottom: '2px solid #ccc', 
    textAlign: 'left', 
    padding: '8px' 
};

// --- KOMPONENT FORMULARZA DODAWANIA PRODUKTU ---

const ProductForm = ({ fetchProducts }) => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [formError, setFormError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setMessage('');

        try {
            // Wysłanie danych do chronionego endpointu POST /api/products
            await axiosInstance.post('/products', {
                title,
                price: parseFloat(price),
                stock_quantity: parseInt(stock),
                description
            });

            setMessage(`Produkt "${title}" został pomyślnie dodany.`);
            
            // Wyczyść formularz
            setTitle('');
            setPrice('');
            setStock('');
            setDescription('');

            // Odśwież listę
            fetchProducts(); 

        } catch (err) {
            setFormError(err.response?.data?.message || 'Błąd dodawania produktu.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #eee', padding: '15px' }}>
            <h4>Dodaj Nowy Produkt (CRUD - CREATE)</h4>
            <div>
                <input type="text" placeholder="Tytuł" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
                <input type="number" placeholder="Cena (PLN)" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" required />
            </div>
            <div>
                <input type="number" placeholder="Stan Magazynowy" value={stock} onChange={(e) => setStock(e.target.value)} required />
            </div>
            <div>
                <textarea placeholder="Opis" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>
            
            <button type="submit">Dodaj Produkt</button>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
        </form>
    );
};

export default AdminDashboard;