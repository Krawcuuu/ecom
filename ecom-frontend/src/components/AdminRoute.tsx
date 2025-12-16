// ecom-frontend/src/components/AdminRoute.tsx

import React from 'react';
import type { FC, ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminRouteProps {
    children: ReactElement;
}

const AdminRoute: FC<AdminRouteProps> = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    
    // Używamy pola 'role' z obiektu 'user'
    const isAdmin = user?.role === 'admin';

    if (loading) {
        return <div>Sprawdzanie uprawnień...</div>;
    }
    
    // 1. Użytkownik musi być zalogowany
    // 2. Musi posiadać rolę 'admin'
    if (isAuthenticated && isAdmin) {
        return children;
    }

    // Jeśli nie jest zalogowany, przejdź do /login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // Jeśli jest zalogowany, ale nie jest adminem, przejdź na główną (lub 403)
    // Zmieniamy na / (Homepage), aby ukryć stronę admina
    return <Navigate to="/" replace />; 
};

export default AdminRoute;