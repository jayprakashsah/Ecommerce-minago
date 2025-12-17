import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';

/* ✅ ONLY ADDITION */
const API = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
  const navigate = useNavigate();
  
  // Toggle State: true = Login, false = Register
  const [isLoginMode, setIsLoginMode] = useState(true); 

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const url = `${API}${endpoint}`;

    try {
      // By default, everyone registering here is a 'user'
      const payload = { 
        username, 
        password,
        role: 'user' // Explicitly set role to user
      };

      const response = await axios.post(url, payload);

      if (isLoginMode) {
        // --- LOGIN SUCCESS ---
        const { token, role } = response.data;
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("isLoggedIn", "true");
        
        onLogin(role);
        navigate(role === 'admin' ? '/admin' : '/products');
      } else {
        // --- REGISTER SUCCESS ---
        alert("Registration Successful! Please Login.");
        setIsLoginMode(true); // Switch to login screen
      }

    } catch (err) {
      setError(err.response?.data?.message || "Operation Failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-slate-50 px-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-sm w-full">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-indigo-900">
            {isLoginMode ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {isLoginMode ? "Please login to your account" : "Join us today!"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Username</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg mt-4"
          >
            {isLoginMode ? "Sign In" : "Register"}
          </button>
        </form>
        
        {/* Toggle Link */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {isLoginMode ? "New here? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} 
            className="text-indigo-600 font-bold hover:underline"
          >
            {isLoginMode ? "Register Now" : "Login Here"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;