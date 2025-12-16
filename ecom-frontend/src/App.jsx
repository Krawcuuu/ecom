// ecom-frontend/src/App.jsx (Fragment)
// ...
import OrderHistory from './pages/OrderHistory'; // OSTATNI IMPORT
// ...

function App() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  
  return (
    <Router>
      <header>
        <nav style={{ padding: '10px', backgroundColor: '#f4f4f4' }}>
          <Link to="/">Sklep</Link>
          <Link to="/cart" style={{ marginLeft: '15px' }}>Koszyk</Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin && <Link to="/admin/dashboard" style={{ marginLeft: '15px' }}>Panel Admina</Link>}
              {/* NOWY LINK DLA KLIENTA */}
              <Link to="/history" style={{ marginLeft: '15px' }}>Moje Zamówienia</Link> 
              <button onClick={logout} style={{ float: 'right' }}>Wyloguj</button>
            </>
          ) : (
            <Link to="/login" style={{ float: 'right' }}>Zaloguj</Link>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          {/* ... Trasy bez zmian */}
          <Route path="/cart" element={<CartPage />} /> 
          <Route path="/checkout" element={<ProtectedRoute element={CheckoutPage} />} /> 
          
          {/* TRASA DLA HISTORII (Chroniona) */}
          <Route path="/history" element={<ProtectedRoute element={OrderHistory} />} />
          
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute element={AdminDashboard} isAdmin={true} />} 
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;