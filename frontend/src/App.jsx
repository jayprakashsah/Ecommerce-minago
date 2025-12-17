import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import RegisterSeller from './pages/RegisterSeller';
<Route path="/register-seller" element={<RegisterSeller />} />

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import PaymentGateway from './pages/PaymentGateway'; // <--- Payment Gateway Import

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
    
    // Check Auth on Load
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
      fetchCart(token);
    }
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:3000/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error loading products:", err));
  };

  const fetchCart = async (token) => {
    try {
      const res = await axios.get('http://localhost:3000/cart', {
        headers: { Authorization: token }
      });
      setCart(res.data);
    } catch (err) { console.error("Error loading cart:", err); }
  };

  // --- AUTH HANDLERS ---
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

  // --- CART HANDLERS ---
  const addToCart = async (product) => {
    const token = sessionStorage.getItem("token");
    if (!token) { alert("Please Login First!"); return; }
    try {
      const res = await axios.post('http://localhost:3000/cart', product, { headers: { Authorization: token } });
      setCart(res.data);
      alert("Added to Cart!");
    } catch (error) { console.error(error); }
  };

  const updateQty = async (id, delta) => {
    const token = sessionStorage.getItem("token");
    const item = cart.find(item => item.product._id === id);
    if (!item) return;
    try {
      const res = await axios.put(`http://localhost:3000/cart/${id}`, { qty: item.quantity + delta }, { headers: { Authorization: token } });
      setCart(res.data);
    } catch (error) { console.error(error); }
  };

  const deleteItem = async (id) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.delete(`http://localhost:3000/cart/${id}`, { headers: { Authorization: token } });
      setCart(res.data);
    } catch (error) { console.error(error); }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col justify-between">
      <Navbar cartCount={cart.length} isLoggedIn={isLoggedIn} userRole={userRole} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home topProducts={products.slice(0,3)} onAddToCart={addToCart} />} />
        <Route path="/register-seller" element={<RegisterSeller />} />
        <Route path="/products" element={
          <div className="container mx-auto px-6 mt-10 mb-20">
             <h2 className="text-3xl font-bold text-gray-900 mb-8">All Products</h2>
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
        } />
        
        {/* PRODUCT DETAILS ROUTE */}
        <Route 
          path="/product/:id" 
          element={<ProductDetails onAddToCart={addToCart} />} 
        />

        <Route path="/cart" element={
          <div className="container mx-auto px-6 mt-10 mb-20">
             <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h2>
             <Cart 
               cartItems={cart.map(item => {
                  if (!item.product) return null;
                  return {
                    ...item.product,   
                    qty: item.quantity, 
                    _id: item.product._id, 
                    id: item.product._id
                  };
               }).filter(Boolean)} 
               onUpdateQty={updateQty} 
               onRemove={deleteItem} 
             />
          </div>
        } />

        {/* CHECKOUT ROUTE */}
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              {/* Passing cart allows fallback if user visits checkout manually without "Buy Now" */}
              <Checkout cart={cart.map(item => ({...item.product, qty: item.quantity}))} />
            </ProtectedRoute>
          } 
        />

        {/* --- NEW: PAYMENT GATEWAY ROUTE --- */}
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
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roleRequired="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>

      <div className="bg-slate-900 text-slate-400 py-12 text-center text-sm mt-auto">
        <p>&copy; 2024 Minago Shop. Powered by MongoDB.</p>
      </div>
    </div>
  );
}

export default App;