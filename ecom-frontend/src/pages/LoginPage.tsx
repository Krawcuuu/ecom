import React, { useState } from 'react';
import type { FC } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx'; 

const LoginPage: FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Pobieramy funkcję logowania z kontekstu
    const { login } = useAuth(); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            // Funkcja login powinna wywołać API i zapisać token
            await login(formData.email, formData.password); 
            
            setMessage('Zalogowano pomyślnie!');
            setLoading(false);

            // Przekierowanie na stronę główną lub do koszyka
            setTimeout(() => navigate('/'), 1000); 

        } catch (error: any) {
            setLoading(false);
            // Błąd pochodzi z AuthContext (lub bezpośrednio z Axios)
            const errorMessage = error.message || 'Niepoprawny login lub hasło.'; 
            setMessage(errorMessage);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Logowanie do Konta</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="email"
                    name="email"
                    placeholder="Adres E-mail"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Hasło"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Logowanie...' : 'Zaloguj się'}
                </button>
            </form>

            {message && (
                <p style={message.includes('Błąd') || message.includes('Niepoprawny') ? styles.error : styles.success}>
                    {message}
                </p>
            )}

            <p style={{ marginTop: '15px' }}>
                Nie masz konta? <Link to="/register">Zarejestruj się</Link>
            </p>
        </div>
    );
};

// Lokalny styl
const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '20px', maxWidth: '400px', margin: '0 auto' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    error: { color: 'red', marginTop: '10px', fontWeight: 'bold' },
    success: { color: 'green', marginTop: '10px', fontWeight: 'bold' },
};

export default LoginPage;