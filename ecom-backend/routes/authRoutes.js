// ecom-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db'); // Używamy naszego modułu db.js
require('dotenv').config();

// Endpoint do logowania (dla klienta i administratora)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Znajdź użytkownika w bazie (używamy ? jako placeholder dla mysql2)
        const users = await query('SELECT id, email, password_hash, role FROM users WHERE email = ?', [email]);
        
        // W mysql2, query zwraca tablicę wierszy, bierzemy pierwszy
        const user = users[0]; 

        if (!user) {
            return res.status(401).json({ message: 'Nieprawidłowy login lub hasło.' });
        }

        // 2. Porównaj hasło (użyj bcryptjs)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Nieprawidłowy login lub hasło.' });
        }

        // 3. Generowanie tokenu JWT (zawiera ID i Rolę)
        const payload = { 
            id: user.id, 
            role: user.role 
        };

        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } // Token wygasa po godzinie
        );

        // Zwróć token i rolę do frontendu
        res.json({ token, role: user.role, userId: user.id });

    } catch (err) {
        console.error('Błąd logowania:', err);
        res.status(500).json({ message: 'Błąd serwera podczas logowania.' });
    }
});

module.exports = router;