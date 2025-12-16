import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- Importy Stron ---
import HomePage from './pages/HomePage.tsx'; 
import ProductDetails from './pages/ProductDetails.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import CartPage from './pages/CartPage.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';

import UserProfilePage from './pages/UserProfile.tsx'; 

import CheckoutPage from './pages/CheckoutPage.tsx'; 
import OrderHistory from './pages/OrderHistory.tsx'; 



import Header from './components/Header.tsx'; 
import Footer from './components/Footer.tsx'; 
import PrivateRoute from './components/PrivateRoute.tsx'; 
import AdminRoute from './components/AdminRoute.tsx'; 


import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx'; 


function App() {
    return (
        // Konteksty muszą obejmować cały Router
        <AuthProvider>
        <CartProvider>
            <BrowserRouter> 
                <div className="App">
                    {/* Nagłówek jest na zewnątrz routingu, widoczny na każdej stronie */}
                    <Header /> 

                    <main className="content" style={{ minHeight: '80vh', paddingBottom: '70px' }}>
                        <Routes>
                            
                            {/* 1. Trasy publiczne */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/product/:id" element={<ProductDetails />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            
                            {/* 2. Trasy chronione (PrivateRoute) */}
                            
                            {/* Chroniona trasa profilu użytkownika */}
                            <Route 
                                path="/profile" 
                                element={
                                    <PrivateRoute>
                                        <UserProfilePage /> 
                                    </PrivateRoute>
                                } 
                            />
                            
                            {/* DODANE: Trasa Checkout Page */}
                            <Route 
                                path="/checkout" 
                                element={
                                    <PrivateRoute>
                                        <CheckoutPage /> 
                                    </PrivateRoute>
                                } 
                            />
                            
                            {/* DODANE: Trasa Historii Zamówień */}
                            <Route 
                                path="/orders" 
                                element={
                                    <PrivateRoute>
                                        <OrderHistory /> 
                                    </PrivateRoute>
                                } 
                            />

                            {/* 3. Trasy administracyjne (AdminRoute) */}
                            <Route 
                                path="/admin" // Zwykle /admin, a nie /admin/dashboard
                                element={
                                    <AdminRoute>
                                        <AdminDashboard />
                                    </AdminRoute>
                                } 
                            />
                            
                            {/* 4. Trasa 404 - Opcjonalnie */}
                             <Route path="*" element={<h1>404 | Strona nie znaleziona</h1>} />

                        </Routes>
                    </main>

                    {/* Stopka na dole */}
                    <Footer /> 
                </div>
            </BrowserRouter>
        </CartProvider>
        </AuthProvider>
    );
}

export default App;