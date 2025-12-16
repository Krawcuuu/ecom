import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import axiosInstance from '../api/axiosInstance'; // Używamy importu bez .ts
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

// --- 1. Definicja Typów ---

// Typ dla statusu zamówienia (używamy unii typów, jeśli znamy możliwe statusy)
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

// Definicja struktury pojedynczego zamówienia
interface Order {
    id: number;
    user_id: number;
    total_amount: string; // Przechowujemy jako string
    status: OrderStatus; 
    created_at: string; // Data w formacie ISO string
    // Można tu dodać items: OrderItem[] jeśli będą szczegóły
}

// Typ dla propsów CSS
interface CSSProperties {
    [key: string]: React.CSSProperties;
}


// --- 2. Główny Komponent Historii Zamówień ---
const OrderHistory: FC = () => {
    // Stan zamówień jest typowany jako tablica Order
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    // Stan błędu jest typowany jako string lub null
    const [error, setError] = useState<string | null>(null);
    
    // Używamy kontekstu Auth
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Wykonuje się tylko, jeśli isAuthenticated się zmieni (lub po pierwszym renderowaniu)
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login'); // Wymuś logowanie, jeśli użytkownik nie jest zalogowany
            return;
        }
        fetchOrders();
    }, [isAuthenticated, navigate]); // Dodano navigate do zależności, aby spełnić wymogi hooków

    const fetchOrders = async () => {
        try {
            // Typujemy oczekiwaną odpowiedź Axios jako tablica Order
            const response = await axiosInstance.get<Order[]>('/orders/history');
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Błąd ładowania historii zamówień. Upewnij się, że jesteś zalogowany.');
            setLoading(false);
        }
    };

    // Obsługa stanów
    if (loading) return <div>Ładowanie historii zamówień...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
    
    // Użycie obiektu styles dla komponentu
    const { cardStyle } = styles;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Twoja Historia Zamówień</h2>
            
            {orders.length === 0 ? (
                <p>Nie złożono jeszcze żadnych zamówień.</p>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Typowanie w mapie: order jest typu Order */}
                    {orders.map((order: Order) => (
                        <div key={order.id} style={cardStyle}>
                            <h4>Zamówienie #{order.id}</h4>
                            <p>Status: <span style={{ fontWeight: 'bold', color: order.status === 'paid' ? 'green' : 'orange' }}>{order.status.toUpperCase()}</span></p>
                            <p>Kwota całkowita: <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{parseFloat(order.total_amount).toFixed(2)} PLN</span></p>
                            <p>Data: {new Date(order.created_at).toLocaleDateString()}</p>
                            {/* Tutaj można by dodać przycisk do podglądu szczegółów pozycji zamówienia */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- 3. Style ---

const styles: CSSProperties = {
    cardStyle: {
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9'
    }
};

export default OrderHistory;