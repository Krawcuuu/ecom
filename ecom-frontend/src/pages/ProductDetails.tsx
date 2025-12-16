import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx'; 

// --- 1. Definicja Typów ---

// 1.1 Typ dla głównego obiektu Product (rozszerzony o pola do ocen)
interface Product {
    id: number;
    title: string;
    description: string;
    price: string;
    stock_quantity: number;
    // Pola związane z ocenami z backendu
    average_rating: number;
    review_count: number;
}

// 1.2 Typ dla pojedynczej recenzji
interface Rating {
    id: number;
    score: number;
    comment: string;
    user_id: number;
    created_at: string;
}

// 1.3 Typ dla propsów StarRating
interface StarRatingProps {
    rating: number;
    count?: number; // Opcjonalny
}

// 1.4 Typ dla propsów RatingSection
interface RatingSectionProps {
    productId: number;
    refreshProduct: () => Promise<void>;
}


// --- KOMPONENT POMOCNICZY: Wyświetlanie Gwiazdek (StarRating) ---
const StarRating: FC<StarRatingProps> = ({ rating, count }) => {
    // Generuje łańcuch znaków z pełnymi i pustymi gwiazdkami na podstawie oceny
    const roundedRating = Math.round(rating);
    // Użycie Math.max, aby uniknąć ujemnej liczby gwiazdek
    const fullStars = '★'.repeat(Math.max(0, roundedRating));
    const emptyStars = '☆'.repeat(Math.max(0, 5 - roundedRating));
    
    return (
        <span style={{ color: '#ffc107', fontSize: '1.2em' }}>
            {fullStars}{emptyStars} 
            {/* Wyświetla liczbę recenzji, jeśli count jest przekazany i większy niż 0 */}
            {count !== undefined && count > 0 && ` (${count} recenzji)`}
        </span>
    );
};


// --- KOMPONENT: SEKCJA OCEN I RECENZJI (RatingSection) ---
const RatingSection: FC<RatingSectionProps> = ({ productId, refreshProduct }) => {
    const { isAuthenticated } = useAuth();
    // Stan oceny jako string, ponieważ input zwraca string
    const [score, setScore] = useState<string>('5'); 
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    // Stan recenzji jest typowany jako tablica Rating
    const [ratings, setRatings] = useState<Rating[]>([]);

    // Pobieranie wszystkich recenzji dla produktu
    useEffect(() => {
        fetchRatings();
    }, [productId]);

    const fetchRatings = async () => {
        try {
            // Typujemy odpowiedź Axios
            const response = await axiosInstance.get<Rating[]>(`/ratings/${productId}`);
            setRatings(response.data);
        } catch (err) {
            console.error("Błąd pobierania recenzji:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => { // Typujemy zdarzenie formularza
        e.preventDefault();
        setMessage('');

        try {
            const response = await axiosInstance.post('/ratings', {
                productId,
                score: parseInt(score), // Konwersja na number przed wysłaniem
                comment
            });
            
            // response.data.message jest zakładany na podstawie .jsx
            setMessage(response.data.message); 
            setComment('');
            setScore('5');
            
            // Odśwież dane produktu i listę recenzji
            refreshProduct();
            fetchRatings();

        } catch (err: any) { 
            // Bezpieczna obsługa błędu Axios
            setMessage(err.response?.data?.message || 'Błąd dodawania recenzji.');
        }
    };

    return (
        <div>
            <h3>Recenzje i Oceny ({ratings.length})</h3>

            {/* Formularz dodawania recenzji */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
                    <h4>Dodaj swoją recenzję</h4>
                    <label>Ocena (1-5):</label>
                    <input 
                        type="number" 
                        min="1" 
                        max="5" 
                        value={score} 
                        onChange={(e) => setScore(e.target.value)} // e.target.value jest stringiem
                        required 
                        style={{ width: '80px', margin: '0 10px' }} 
                    />
                    <textarea 
                        placeholder="Twój komentarz (opcjonalnie)" 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)} 
                        rows={3} 
                    />
                    <button type="submit">Prześlij Ocenę</button>
                    
                    {message && (
                        <p style={{ color: message.startsWith('Błąd') || message.includes('Już oceniłeś') ? 'red' : 'green' }}>
                            {message}
                        </p>
                    )}
                </form>
            ) : (
                <p>Musisz być zalogowany, aby dodać recenzję.</p>
            )}

            {/* Lista istniejących recenzji */}
            {ratings.map((rating: Rating, index) => ( // Typujemy element w map
                <div key={rating.id || index} style={{ borderBottom: '1px dotted #ccc', padding: '10px 0' }}>
                    <p>
                        <StarRating rating={rating.score} /> - <small>{new Date(rating.created_at).toLocaleDateString()}</small>
                    </p>
                    {rating.comment && <p style={{ fontStyle: 'italic' }}>"{rating.comment}"</p>}
                </div>
            ))}
        </div>
    );
};


// --- GŁÓWNY KOMPONENT: SZCZEGÓŁY PRODUKTU ---
const ProductDetails: FC = () => {
    // useParams zwraca obiekt z stringami
    const { id } = useParams<{ id: string }>(); 
    // Stan product jest typowany jako Product lub null
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    
    // używamy useCart (który wymaga, aby product miał pola id, title, price)
    const { addToCart } = useCart(); 
    const navigate = useNavigate();

    // Funkcja pobierania danych produktu
    const fetchProduct = async () => {
        if (!id) return; // Zabezpieczenie na wypadek braku ID
        
        try {
            // Typujemy oczekiwaną odpowiedź jako Product
            const response = await axiosInstance.get<Product>(`/products/${id}`); 
            setProduct(response.data);
            setLoading(false);
        } catch (err) {
            setError('Produkt nie został znaleziony lub wystąpił błąd serwera.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        // Zabezpieczenie typu - sprawdzenie, czy product nie jest null
        if (!product) {
            alert('Brak danych produktu.');
            return;
        }

        // Walidacja ilości
        if (product.stock_quantity >= quantity && quantity > 0) {
             // Tworzymy obiekt oczekiwany przez CartContext
            const productForCart = {
                id: product.id,
                title: product.title,
                price: product.price,
            };

            //addToCart(product, quantity); // Oryginalnie
            addToCart(productForCart, quantity);
            alert(`${quantity}x ${product.title} dodano do koszyka!`);
        } else {
            alert('Wprowadzono niepoprawną ilość lub brak wystarczającego stanu magazynowego.');
        }
    };

    // Obsługa stanów
    if (loading) return <div>Ładowanie szczegółów produktu...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
    // Ostateczne sprawdzenie przed renderowaniem szczegółów
    if (!product) return <div>Brak danych produktu.</div>;

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>← Wróć do sklepu</button>
            
            <h1>{product.title}</h1>
            
            {/* WYŚWIETLANIE OCENY ŚREDNIEJ */}
            <div style={{ margin: '10px 0' }}>
                <StarRating 
                    rating={product.average_rating} 
                    count={product.review_count} 
                />
            </div>
            
            <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '10px 0' }}>
                Cena: {parseFloat(product.price).toFixed(2)} PLN
            </p>
            
            <p style={{ fontWeight: 'bold', color: product.stock_quantity > 0 ? 'green' : 'red' }}>
                Stan Magazynowy: {product.stock_quantity} szt.
            </p>

            <h3 style={{ marginTop: '20px' }}>Opis:</h3>
            <p>{product.description}</p>

            {/* SEKCJA DODANIA DO KOSZYKA */}
            <div style={{ margin: '30px 0', border: '1px solid #eee', padding: '15px', display: 'inline-block' }}>
                <label>Ilość:</label>
                <input 
                    type="number" 
                    min="1" 
                    // Maksymalna ilość nie może przekraczać stanu magazynowego
                    max={product.stock_quantity}
                    value={quantity}
                    // Wymuś, aby wartość była liczbą całkowitą i większa niż 0
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setQuantity(isNaN(val) || val < 1 ? 1 : val);
                    }}
                    style={{ width: '60px', margin: '0 10px' }}
                />
                <button 
                    onClick={handleAddToCart} 
                    disabled={product.stock_quantity === 0 || quantity > product.stock_quantity}
                >
                    Dodaj do koszyka
                </button>
            </div>

            <hr style={{ margin: '30px 0' }} />

            {/* SEKCJA OCEN I RECENZJI */}
            {/* Przekazujemy ID i typowaną funkcję odświeżającą */}
            <RatingSection productId={product.id} refreshProduct={fetchProduct} /> 

        </div>
    );
};

export default ProductDetails;