// ecom-frontend/src/context/CartContext.tsx 

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, FC } from 'react';

// --- 1. Definicja Typów ---

// 1.1 Typ dla pojedynczego produktu/elementu w koszyku
// TEGO TYPU UŻYWA CartPage.tsx
interface CartItem {
    productId: number;
    title: string;
    price: string; // Przechowywane jako string (jak często z backendu), ale konwertowane na number w kalkulacjach
    quantity: number;
}

// 1.2 Typ dla całego kontekstu (co zwraca useCart())
interface CartContextType {
    cart: CartItem[]; // To jest to, czego brakowało, powodując błędy w CartPage.tsx
    totalItems: number;
    addToCart: (product: { id: number, title: string, price: string }, quantity: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => string;
}

// Inicjalizacja kontekstu z typem CartContextType lub undefined
const CartContext = createContext<CartContextType | undefined>(undefined);

// --- 2. Komponent Providera ---

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: FC<CartProviderProps> = ({ children }) => {
    // Stan koszyka jest typowany jako tablica CartItem
    const [cart, setCart] = useState<CartItem[]>([]);

    // Załaduj koszyk z localStorage przy starcie
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            // Używamy asercji typu przy ładowaniu z localStorage
            setCart(JSON.parse(storedCart) as CartItem[]);
        }
    }, []);

    // Zapisz koszyk do localStorage po każdej zmianie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Funkcje operacji na koszyku
    
    // Używamy jawnego typu dla produktu, który jest dodawany do koszyka
    const addToCart = (product: { id: number, title: string, price: string }, quantity: number): void => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);

            if (existingItem) {
                // Jeśli produkt istnieje, zwiększ ilość
                return prevCart.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Jeśli produkt jest nowy, dodaj go
                const newItem: CartItem = {
                    productId: product.id,
                    title: product.title,
                    price: product.price,
                    quantity: quantity,
                };
                return [...prevCart, newItem];
            }
        });
    };

    const removeFromCart = (productId: number): void => {
        setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    };
    
    const updateQuantity = (productId: number, quantity: number): void => {
        setCart(prevCart => prevCart.map(item =>
            item.productId === productId
                ? { ...item, quantity: quantity > 0 ? quantity : 1 }
                : item
        ));
    };

    const clearCart = (): void => {
        setCart([]);
    };

    const getTotalPrice = (): string => {
        const total = cart.reduce((acc, item) => {
            // Bezpieczna konwersja ceny na liczbę
            const price = parseFloat(item.price); 
            return acc + (isNaN(price) ? 0 : price * item.quantity);
        }, 0);
        return total.toFixed(2);
    };

    const totalItems: number = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Zapewniamy, że zwracana wartość pasuje do interfejsu CartContextType
    const contextValue: CartContextType = {
        cart,
        totalItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

// --- 3. Hook do Użycia Kontekstu (z zabezpieczeniem) ---

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    
    if (context === undefined) {
        throw new Error('useCart musi być użyty wewnątrz CartProvider');
    }
    
    return context;
};