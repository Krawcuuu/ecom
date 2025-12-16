import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import axiosInstance from '../api/axiosInstance';

// --- 1. Definicja Typów ---

// Typ dla danych użytkownika (musisz dopasować do swojego backendu)
interface UserData {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    // Pamiętaj: Jeśli używasz obiektu 'user' z kontekstu, musi on być zgodny z tym typem!
}

// Typ dla propsów CSS
interface CSSProperties {
    [key: string]: React.CSSProperties;
}


// --- 2. Główny Komponent Strony Profilu ---
const UserProfilePage: FC = () => {
    // Pobieramy user i funkcje z kontekstu Auth (zał. że są typowane w AuthContext.tsx)
    const { isAuthenticated, logout } = useAuth();
    
    // Stan danych profilu jest typowany jako UserData lub null
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Natychmiastowe przekierowanie, jeśli użytkownik nie jest zalogowany
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        fetchUserProfile();
    }, [isAuthenticated, navigate]);

    // Funkcja pobierająca dane profilowe z API
    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            // Typujemy oczekiwaną odpowiedź jako UserData
            const response = await axiosInstance.get<UserData>('/users/profile'); 
            setUserData(response.data);
        } catch (error) {
            setMessage('Nie udało się załadować danych profilu.');
        } finally {
            setLoading(false);
        }
    };
    
    // Obsługa zmiany pól formularza
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UserData) => {
        if (userData) {
             // Typujemy pole field jako klucz interfejsu UserData
            setUserData({...userData, [field]: e.target.value});
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!userData) return;

        try {
            // Wysłanie tylko tych pól, które mogą być edytowane
            await axiosInstance.put('/users/profile', userData);
            setMessage('Profil zaktualizowany pomyślnie!');
            setIsEditing(false);
            // Opcjonalnie: odświeżenie danych użytkownika w AuthContext
            // refreshUser(); 
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Błąd aktualizacji profilu.');
        }
    };
    
    // Walidacja autoryzacji i stanów
    if (!isAuthenticated || loading) return <div>Ładowanie profilu...</div>;
    if (!userData) return <div style={{ color: 'red', padding: '20px' }}>{message || "Brak danych użytkownika."}</div>;

    return (
        <div style={styles.container}>
            <h2>Profil Użytkownika: {userData.username}</h2>
            <button onClick={() => setIsEditing(!isEditing)} style={styles.editButton}>
                {isEditing ? 'Anuluj' : 'Edytuj Profil'}
            </button>

            <form onSubmit={handleUpdate} style={styles.form}>
                
                {/* Nieedytowalne pola */}
                <div>
                    <label>Nazwa użytkownika:</label>
                    <input type="text" value={userData.username} disabled />
                </div>
                <div>
                    <label>E-mail:</label>
                    <input type="email" value={userData.email} disabled />
                </div>
                
                {/* Edytowalne pola */}
                <div>
                    <label>Imię:</label>
                    <input 
                        type="text" 
                        value={userData.firstName} 
                        disabled={!isEditing}
                        onChange={(e) => handleFieldChange(e, 'firstName')}
                    />
                </div>
                 <div>
                    <label>Nazwisko:</label>
                    <input 
                        type="text" 
                        value={userData.lastName} 
                        disabled={!isEditing}
                        onChange={(e) => handleFieldChange(e, 'lastName')}
                    />
                </div>
                
                {isEditing && (
                    <button type="submit">Zapisz Zmiany</button>
                )}
            </form>
            
            {message && <p style={message.includes('Błąd') ? styles.error : styles.success}>{message}</p>}
            
            <button onClick={() => { logout(); navigate('/'); }} style={styles.logoutButton}>
                Wyloguj się
            </button>
        </div>
    );
};

// --- 3. Style ---
const styles: CSSProperties = {
    container: { padding: '20px', maxWidth: '600px', margin: '0 auto' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    error: { color: 'red', marginTop: '10px', fontWeight: 'bold' },
    success: { color: 'green', marginTop: '10px', fontWeight: 'bold' },
    logoutButton: { marginTop: '30px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' },
    editButton: { float: 'right', backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }
};

export default UserProfilePage;