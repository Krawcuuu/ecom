// ecom-backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. Middleware Sprawdzający, czy użytkownik jest zalogowany
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Pobierz token z nagłówka
            token = req.headers.authorization.split(' ')[1];

            // Weryfikacja tokenu (JWT.verify)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Dołącz dane użytkownika (id, role) do obiektu żądania
            req.user = decoded; 
            next();
        } catch (error) {
            console.error(error);
            // Zwróć błąd jeśli token jest nieważny lub wygasł
            res.status(401).json({ message: 'Brak autoryzacji, token nieprawidłowy.' });
        }
    }

    if (!token) {
        // Zwróć błąd jeśli brakuje nagłówka Authorization
        res.status(401).json({ message: 'Brak tokenu autoryzacyjnego.' });
    }
};

// 2. Middleware Sprawdzający, czy użytkownik ma rolę 'admin'
const admin = (req, res, next) => {
    // Sprawdzamy, czy dane użytkownika zostały dodane przez 'protect'
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Brak dostępu. Wymagana rola Administratora.' });
    }
};

module.exports = { protect, admin };