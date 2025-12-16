// ecom-backend/db.js
require('dotenv').config();
const mysql = require('mysql2/promise'); // Używamy promise API

// Tworzenie puli połączeń
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Funkcja do wykonywania zapytań (zwraca tylko pierwszy element tablicy - dane)
const query = async (sql, params) => {
    try {
        // execute zwraca [rows, fields]
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error("Błąd zapytania do bazy danych:", error);
        throw error; // Propagacja błędu do warstwy API
    }
};

module.exports = {
    query,
};
// ecom-backend/db.js (Dodaj to na dole pliku)

// Weryfikacja połączenia
pool.getConnection()
    .then(connection => {
        console.log('✅ Połączenie z bazą danych MySQL/MariaDB udane!');
        connection.release(); // Zwolnij połączenie z powrotem do puli
    })
    .catch(err => {
        console.error('❌ BŁĄD KRYTYCZNY: Nie udało się połączyć z bazą danych!', err.code);
        console.error('Sprawdź konfigurację w pliku .env (HOST, USER, PASSWORD, PORT).');
    });

module.exports = {
    query,
};