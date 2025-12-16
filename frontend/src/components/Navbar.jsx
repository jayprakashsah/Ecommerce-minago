import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaStore, FaUserCircle, FaSignOutAlt, FaClipboardList, FaChartLine, FaBars, FaTimes } from 'react-icons/fa';

function Navbar({ cartCount, isLoggedIn, userRole, onLogout }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // --- ADMIN NAVBAR (Mobile Responsive) ---
  if (isLoggedIn && userRole === 'admin') {
    return (
      <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/admin" className="text-xl font-bold flex items-center gap-2">
            <FaStore className="text-2xl" />
            <span>Minago<span className="text-indigo-400">Admin</span></span>
          </Link>

          {/* Desktop Links (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 hover:text-indigo-400 font-medium"><FaChartLine /> Dashboard</button>
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 hover:text-indigo-400 font-medium"><FaUserCircle /> Profile</button>
            <button onClick={onLogout} className="text-gray-400 hover:text-red-400"><FaSignOutAlt /></button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-800 p-4 space-y-4 border-t border-slate-700">
            <button onClick={() => { navigate('/admin'); closeMenu(); }} className="block w-full text-left py-2 hover:text-indigo-400">Dashboard</button>
            <button onClick={() => { navigate('/profile'); closeMenu(); }} className="block w-full text-left py-2 hover:text-indigo-400">Profile</button>
            <button onClick={() => { onLogout(); closeMenu(); }} className="block w-full text-left py-2 text-red-400">Logout</button>
          </div>
        )}
      </nav>
    );
  }

  // --- USER NAVBAR (Mobile Responsive) ---
  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100 backdrop-blur-md bg-opacity-95 text-slate-800">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-extrabold text-indigo-900 flex items-center gap-2">
          <FaStore className="text-2xl text-indigo-600" />
          <span>Minago<span className="text-indigo-600">Shop</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-bold hover:text-indigo-600">Home</Link>
          <Link to="/products" className="font-bold hover:text-indigo-600">Products</Link>
          
          <Link to="/cart" className="relative group p-2">
            <FaShoppingCart className="text-xl text-gray-600 group-hover:text-indigo-600 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
              <button onClick={() => navigate('/profile')} className="hover:text-indigo-600"><FaUserCircle className="text-2xl" /></button>
              <button onClick={onLogout} className="text-gray-400 hover:text-red-500"><FaSignOutAlt /></button>
            </div>
          ) : (
            <Link to="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200">Login</Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg absolute w-full left-0 top-16 z-50">
          <Link to="/" onClick={closeMenu} className="block font-bold text-gray-700 py-2">Home</Link>
          <Link to="/products" onClick={closeMenu} className="block font-bold text-gray-700 py-2">Products</Link>
          <Link to="/cart" onClick={closeMenu} className="block font-bold text-gray-700 py-2 flex items-center gap-2">
            Cart {cartCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
          </Link>
          
          <div className="border-t border-gray-100 pt-2">
            {isLoggedIn ? (
              <>
                <button onClick={() => { navigate('/profile'); closeMenu(); }} className="block w-full text-left py-2 font-bold text-gray-700">My Profile</button>
                <button onClick={() => { onLogout(); closeMenu(); }} className="block w-full text-left py-2 font-bold text-red-500">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold mt-2">Login / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;