// ecom-frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx'; // Używamy .tsx
import { AuthProvider } from './context/AuthContext.tsx'; 
import { CartProvider } from './context/CartContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render( // <-- DODAJEMY ZNAK "!"
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);