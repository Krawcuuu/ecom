// ecom-backend/server.js (Ostateczna wersja backendu - routing)
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

// Import routerów
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); 
const ratingRoutes = require('./routes/ratingRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Middleware do parsowania JSON i CORS
app.use('/api/orders', orderRoutes);
app.use('/api/ratings', ratingRoutes);
app.use(express.json());
app.use((req, res, next) => {
    // ... konfiguracja CORS (bez zmian)
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// --- ROUOWANIE ---
app.get('/', (req, res) => {
    res.send('E-commerce Backend działa poprawnie.');
});

// Trasy Autoryzacji (Logowanie)
app.use('/api/auth', authRoutes);

// Trasy Produktów (Publiczne GET, Admin POST/PUT/DELETE)
app.use('/api/products', productRoutes); 

app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});