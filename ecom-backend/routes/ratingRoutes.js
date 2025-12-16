// ecom-backend/routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect } = require('../middleware/authMiddleware');

// Funkcja pomocnicza do aktualizacji buforowanych danych w tabeli products
const updateProductRating = async (productId) => {
    // 1. Oblicz średnią i liczbę recenzji
    const [stats] = await query(
        'SELECT AVG(score) as avg_score, COUNT(id) as count FROM ratings WHERE product_id = ?',
        [productId]
    );

    const avgScore = stats.avg_score || 0;
    const count = stats.count || 0;

    // 2. Aktualizuj tabelę products
    await query(
        'UPDATE products SET average_rating = ?, review_count = ? WHERE id = ?',
        [avgScore.toFixed(1), count, productId]
    );
};


// POST /api/ratings - Dodaj nową ocenę
router.post('/', protect, async (req, res) => {
    const userId = req.user.id;
    const { productId, score, comment } = req.body;

    if (!productId || score === undefined || score < 1 || score > 5) {
        return res.status(400).json({ message: 'Wymagane: ID produktu i ocena (1-5).' });
    }

    try {
        // Sprawdź, czy użytkownik już nie ocenił
        const existingRating = await query('SELECT id FROM ratings WHERE product_id = ? AND user_id = ?', [productId, userId]);
        
        if (existingRating.length > 0) {
            return res.status(400).json({ message: 'Już oceniłeś ten produkt.' });
        }

        // Wstaw nową ocenę
        await query(
            'INSERT INTO ratings (product_id, user_id, score, comment) VALUES (?, ?, ?, ?)',
            [productId, userId, score, comment || null]
        );

        // Uruchom aktualizację buforowanych statystyk
        await updateProductRating(productId);

        res.status(201).json({ message: 'Ocena dodana pomyślnie!' });

    } catch (err) {
        console.error("Błąd dodawania oceny:", err);
        res.status(500).json({ message: 'Błąd serwera. Nie udało się dodać oceny.' });
    }
});


// GET /api/ratings/:productId - Pobierz oceny dla produktu
router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const ratings = await query('SELECT score, comment, created_at FROM ratings WHERE product_id = ? ORDER BY created_at DESC', [productId]);
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ message: 'Błąd pobierania ocen.' });
    }
});

module.exports = router;