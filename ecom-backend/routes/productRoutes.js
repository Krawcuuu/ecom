// ecom-backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, admin } = require('../middleware/authMiddleware'); // Importujemy ochronę

// --- Trasy PUBLICZNE (GET) ---

// 1. GET /api/products - Pobierz wszystkie produkty
router.get('/', async (req, res) => {
    try {
        const products = await query('SELECT * FROM products WHERE stock_quantity > 0 ORDER BY created_at DESC');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera podczas pobierania produktów.' });
    }
});


router.get('/', async (req, res) => {
    try {
        
        const products = await query('SELECT * FROM products'); 
        
        
        console.log("PRODUKTY ZWRÓCONE PRZEZ BAZĘ:", products); 
        // -----------------------------
        
        res.json(products);
    } catch (err) {
        
        console.error("Błąd krytyczny w SELECT:", err);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania produktów.' });
    }
});



router.post('/', protect, admin, async (req, res) => {
    const { title, description, price, stock_quantity } = req.body;

    if (!title || !price) {
        return res.status(400).json({ message: 'Tytuł i cena są wymagane.' });
    }
    
    try {
        // Używamy ostatniej składni dla MySQL/MariaDB
        const result = await query(
            'INSERT INTO products (title, description, price, stock_quantity) VALUES (?, ?, ?, ?)',
            [title, description || null, price, stock_quantity || 0]
        );
        // Po wstawieniu, pobieramy nowo utworzony rekord (potrzebny do zwrócenia)
        const newProduct = await query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        res.status(201).json(newProduct[0]);
    } catch (err) {
        res.status(500).json({ message: 'Błąd podczas dodawania produktu.', error: err.message });
    }
});

// 4. PUT /api/products/:id - Edytuj produkt
router.put('/:id', protect, admin, async (req, res) => {
    const { id } = req.params;
    const { title, description, price, stock_quantity } = req.body;

    try {
        const result = await query(
            'UPDATE products SET title = ?, description = ?, price = ?, stock_quantity = ? WHERE id = ?',
            [title, description, price, stock_quantity, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produkt nie znaleziony lub brak zmian.' });
        }

        const updatedProduct = await query('SELECT * FROM products WHERE id = ?', [id]);
        res.json(updatedProduct[0]);
    } catch (err) {
        res.status(500).json({ message: 'Błąd podczas aktualizacji produktu.' });
    }
});

// 5. DELETE /api/products/:id - Usuń produkt
router.delete('/:id', protect, admin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query('DELETE FROM products WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produkt nie znaleziony.' });
        }

        res.json({ message: 'Produkt pomyślnie usunięty.' });
    } catch (err) {
        res.status(500).json({ message: 'Błąd podczas usuwania produktu.' });
    }
});


module.exports = router;