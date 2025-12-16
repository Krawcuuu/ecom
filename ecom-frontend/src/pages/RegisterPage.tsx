import React, { useState } from 'react';
import type { FC } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const RegisterPage: FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        
        if (formData.password !== formData.confirmPassword) {
            setMessage('Hasła nie pasują do siebie.');
            return;
        }

        setLoading(true);

        try {
            // Wysłanie danych tylko z wymaganymi polami
            const { confirmPassword, ...dataToSend } = formData;
            
            const response = await axiosInstance.post('/auth/register', dataToSend);
            
            setMessage(response.data.message || 'Rejestracja udana! Zaloguj się.');
            setLoading(false);

            // Przekierowanie do logowania po sukcesie
            setTimeout(() => navigate('/login'), 2000);

        } catch (error: any) {
            setLoading(false);
            const errorMessage = error.response?.data?.message || 'Błąd rejestracji. Spróbuj ponownie.';
            setMessage(errorMessage);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Rejestracja Nowego Konta</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                
                <input
                    type="text"
                    name="username"
                    placeholder="Nazwa użytkownika"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
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
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Powtórz Hasło"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Rejestrowanie...' : 'Zarejestruj się'}
                </button>
            </form>

            {message && (
                <p style={message.includes('Błąd') || message.includes('nie pasują') ? styles.error : styles.success}>
                    {message}
                </p>
            )}

            <p style={{ marginTop: '15px' }}>
                Masz już konto? <Link to="/login">Zaloguj się tutaj</Link>
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

export default RegisterPage;