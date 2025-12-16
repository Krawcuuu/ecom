// ecom-frontend/src/components/PrivateRoute.tsx

import React from 'react';
import type { FC, ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';


// Oczekujemy na element Reacta, który ma być renderowany, jeśli autoryzacja jest poprawna
interface PrivateRouteProps {
    children: ReactElement;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        // Ważne: Poczekaj, aż AuthProvider zakończy sprawdzanie tokenu
        return <div>Sprawdzanie autoryzacji...</div>;
    }

    // Jeśli użytkownik jest zalogowany, renderuj przekazany element (dziecko)
    if (isAuthenticated) {
        return children;
    }

    // Jeśli nie jest zalogowany, przekieruj na stronę logowania
    // Używamy replace, aby strona logowania nie trafiła do historii przeglądarki
    return <Navigate to="/login" replace />;
};

export default PrivateRoute;