import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import PaymentGateway from './pages/PaymentGateway';
import RegisterSeller from './pages/RegisterSeller';

// ✅ BACKEND API URL (FROM .env)
const API = import.meta.env.VITE_API_URL;

function App() {
  const navigate = useNavigate();

  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchProducts();

    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
      fetchCart(token);
    }
  }, []);

  // --- API CALLS ---
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const fetchCart = async (token) => {
    try {
      const res = await axios.get(`${API}/cart`, {
        headers: { Authorization: token }
      });
      setCart(res.data);
    } catch (err) {
      console.error("Error loading cart:", err);
    }
  };

  // --- AUTH ---
  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    fetchCart(sessionStorage.getItem("token"));
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    setCart([]);
    navigate('/');
  };

  // --- CART ---
  const addToCart = async (product) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Please Login First!");
      return;
    }

    try {
      const res = await axios.post(`${API}/cart`, product, {
        headers: { Authorization: token }
      });
      setCart(res.data);
      alert("Added to Cart!");
    } catch (error) {
      console.error(error);
    }
  };

  const updateQty = async (id, delta) => {
    const token = sessionStorage.getItem("token");
    const item = cart.find(item => item.product?._id === id);
    if (!item) return;

    try {
      const res = await axios.put(
        `${API}/cart/${id}`,
        { qty: item.quantity + delta },
        { headers: { Authorization: token } }
      );
      setCart(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItem = async (id) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.delete(`${API}/cart/${id}`, {
        headers: { Authorization: token }
      });
      setCart(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col justify-between">
      <Navbar
        cartCount={cart.length}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={<Home topProducts={products.slice(0, 3)} onAddToCart={addToCart} />} />

        <Route path="/register-seller" element={<RegisterSeller />} />

        <Route
          path="/products"
          element={
            <div className="container mx-auto px-6 mt-10 mb-20">
              <h2 className="text-3xl font-bold mb-8">All Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {products.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    onAddToCart={addToCart}
                    userRole={userRole}
                  />
                ))}
              </div>
            </div>
          }
        />

        <Route path="/product/:id" element={<ProductDetails onAddToCart={addToCart} />} />

        <Route
          path="/cart"
          element={
            <div className="container mx-auto px-6 mt-10 mb-20">
              <h2 className="text-3xl font-bold mb-8">Your Cart</h2>
              <Cart
                cartItems={cart
                  .map(item => item.product && {
                    ...item.product,
                    qty: item.quantity,
                    id: item.product._id
                  })
                  .filter(Boolean)}
                onUpdateQty={updateQty}
                onRemove={deleteItem}
              />
            </div>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout cart={cart.map(item => ({ ...item.product, qty: item.quantity }))} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-gateway"
          element={
            <ProtectedRoute>
              <PaymentGateway />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roleRequired="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm mt-auto">
        <p>&copy; 2024 Minago Shop. Powered by MongoDB.</p>
      </footer>
    </div>
  );
}

export default App;