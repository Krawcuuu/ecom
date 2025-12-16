import React from 'react';
import type { FC } from 'react'; // Import typu dla komponentów funkcyjnych
import { useCart } from '../context/CartContext.tsx'; // Pamiętaj o użyciu .tsx!
import { useNavigate } from 'react-router-dom';

// --- 1. Definicja Typów (Interfejsy) ---

// Definicja struktury pojedynczego produktu w koszyku
// Musi być zgodna ze strukturą, którą zwraca useCart()
interface CartItem {
    productId: number;
    title: string;
    price: string; // Nadal jako string, jeśli tak zwraca backend
    quantity: number;
    // ... inne dane produktu, jeśli są używane
}

// Typ dla propsów CSS, aby uniknąć błędów typowania stylu
interface CSSProperties {
    [key: string]: React.CSSProperties;
}


// --- 2. Komponent Strony Koszyka ---
const CartPage: FC = () => {
    // 
    // Założenie: useCart() jest poprawnie typowany w CartContext.tsx i zwraca:
    // cart: CartItem[]
    // removeFromCart: (productId: number) => void
    // getTotalPrice: () => string
    // clearCart: () => void
    // totalItems: number
    //
    const { 
        cart, 
        removeFromCart, 
        getTotalPrice, 
        clearCart, 
        totalItems 
    } = useCart();

    const navigate = useNavigate();

    // Jawne typowanie parametru productId jako number
    const handleRemove = (productId: number) => {
        if (window.confirm("Czy na pewno usunąć ten produkt z koszyka?")) {
            removeFromCart(productId);
        }
    };

    const handleClear = () => {
        if (window.confirm("Czy na pewno chcesz wyczyścić cały koszyk?")) {
            clearCart();
        }
    };

    if (cart.length === 0) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Twój Koszyk jest Pusty</h2>
                <button onClick={() => navigate('/')}>Przejdź do Sklepu</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Twój Koszyk ({totalItems} pozycji)</h2>
            <button onClick={handleClear} style={{ float: 'right', color: 'red' }}>Wyczyść Koszyk</button>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th style={styles.tableHeaderStyle}>Produkt</th>
                        <th style={styles.tableHeaderStyle}>Cena jednostkowa</th>
                        <th style={styles.tableHeaderStyle}>Ilość</th>
                        <th style={styles.tableHeaderStyle}>Suma</th>
                        <th style={styles.tableHeaderStyle}>Usuń</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Iteracja przez cart, który jest teraz CartItem[] */}
                    {cart.map((item: CartItem) => (
                        <tr key={item.productId} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={styles.tableCellStyle}>{item.title}</td>
                            <td style={styles.tableCellStyle}>{parseFloat(item.price).toFixed(2)} PLN</td>
                            <td style={styles.tableCellStyle}>{item.quantity}</td>
                            <td style={styles.tableCellStyle}>{(parseFloat(item.price) * item.quantity).toFixed(2)} PLN</td>
                            <td style={styles.tableCellStyle}>
                                <button onClick={() => handleRemove(item.productId)}>Usuń</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={styles.summaryStyle}>
                <h3>Łączna Kwota: {getTotalPrice()} PLN</h3>
                <button onClick={() => navigate('/checkout')} style={styles.checkoutButtonStyle}>
                    Przejdź do Kasy
                </button>
            </div>
        </div>
    );
};

// --- 3. Przeniesienie Stylów do Obiektu Styles ---

// Aby zachować porządek i ułatwić typowanie
const styles: CSSProperties = {
    tableHeaderStyle: { borderBottom: '2px solid #ccc', textAlign: 'left', padding: '8px' },
    tableCellStyle: { padding: '8px' },
    summaryStyle: { 
        marginTop: '30px', 
        borderTop: '2px solid #333', 
        paddingTop: '15px', 
        textAlign: 'right' 
    },
    checkoutButtonStyle: { 
        backgroundColor: '#28a745', 
        color: 'white', 
        padding: '10px 20px', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer' 
    }
};

export default CartPage;