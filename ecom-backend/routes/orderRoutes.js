// ecom-backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect } = require('../middleware/authMiddleware'); // Wymaga zalogowania klienta

// --- KLUCZOWY ENDPOINT: SKŁADANIE ZAMÓWIENIA ---
// POST /api/orders
// Dane wejściowe: { items: [{ productId, quantity }] }
router.post('/', protect, async (req, res) => {
    // req.user.id jest ustawiany przez middleware 'protect'
    const userId = req.user.id; 
    const { items } = req.body; // Oczekiwany format: [{ productId: 1, quantity: 2 }, ...]

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Koszyk nie może być pusty.' });
    }

    // Musimy użyć pojedynczego połączenia, aby zapewnić TRANSKACJĘ!
    let connection; 

    try {
        // Zdobądź połączenie z puli dla transakcji
        // UWAGA: Logika pobierania połączenia różni się w zależności od sterownika MySQL.
        // Zakładamy, że nasza pula w db.js ma metodę getConnection(), jeśli nie, używamy prostego execute.
        
        // Ponieważ użyliśmy mysql2/promise, możemy zaimplementować to bezpiecznie, używając transakcji:
        const pool = require('../db').pool; // Załóżmy, że db.js eksportuje pool
        connection = await pool.getConnection(); // Zdobądź fizyczne połączenie
        await connection.beginTransaction(); // ROZPOCZNIJ TRANSAKCJĘ

        let totalAmount = 0;
        const orderItemsData = [];

        // 1. Walidacja produktów i ilości, OBLICZENIE CENY i ZMNIEJSZENIE STANU MAGAZYNOWEGO
        for (const item of items) {
            const [products] = await connection.execute(
                'SELECT title, price, stock_quantity FROM products WHERE id = ? FOR UPDATE', // Używamy FOR UPDATE do blokowania wierszy
                [item.productId]
            );

            const product = products[0];

            if (!product) {
                await connection.rollback(); // Anuluj całą transakcję
                return res.status(404).json({ message: `Produkt ID ${item.productId} nie znaleziony.` });
            }

            if (product.stock_quantity < item.quantity) {
                await connection.rollback(); // Anuluj całą transakcję
                return res.status(400).json({ message: `Brak wystarczającej ilości produktu: ${product.title}. Dostępnych: ${product.stock_quantity}.` });
            }

            // Zmniejszenie stanu magazynowego w bazie danych
            await connection.execute(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.productId]
            );
            
            // Obliczanie sumy
            const itemPrice = product.price * item.quantity;
            totalAmount += itemPrice;

            // Zapisujemy dane dla pozycji zamówienia
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price // Cena z momentu zamówienia
            });
        }

        // 2. TWORZENIE GŁÓWNEGO ZAMÓWIENIA
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [userId, totalAmount, 'paid'] // Status "paid" zakładamy dla uproszczenia (mock płatności)
        );
        const orderId = orderResult.insertId;

        // 3. TWORZENIE POZYCJI ZAMÓWIENIA (order_items)
        const itemInserts = orderItemsData.map(item => [orderId, item.productId, item.quantity, item.unitPrice]);
        
        // Płaskie zapytanie bulk insert (lepsze dla wydajności)
        await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?',
            [itemInserts]
        );
        
        // ZAKOŃCZENIE TRANSAKCJI
        await connection.commit(); 

        res.status(201).json({ 
            message: 'Zamówienie złożone pomyślnie.', 
            orderId, 
            total: totalAmount 
        });

    } catch (err) {
        if (connection) {
            await connection.rollback(); // W razie błędu cofnij wszystkie zmiany
        }
        console.error('Błąd transakcji składania zamówienia:', err);
        res.status(500).json({ message: 'Błąd serwera. Transakcja zakupu została anulowana.', error: err.message });
    } finally {
        if (connection) {
            connection.release(); // Zawsze zwolnij połączenie
        }
    }
});

// GET /api/orders/history - Historia zamówień (dla klienta)
router.get('/history', protect, async (req, res) => {
    const userId = req.user.id;
    try {
        const orders = await query(
            'SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Błąd pobierania historii zamówień.' });
    }
});


module.exports = router;