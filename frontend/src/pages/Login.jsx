import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

    try {
      const payload = { username, password, role: 'user' };
      const response = await axios.post(`${API}${endpoint}`, payload);

      if (isLoginMode) {
        const { token, role } = response.data;
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("isLoggedIn", "true");

        onLogin(role);
        navigate(role === 'admin' ? '/admin' : '/products');
      } else {
        alert("Registration Successful! Please Login.");
        setIsLoginMode(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation Failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">

        <h2 className="text-3xl font-extrabold text-indigo-900 text-center mb-6">
          {isLoginMode ? "Welcome Back" : "Create Account"}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full pl-10 p-3 border rounded-lg"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 p-3 border rounded-lg"
              required
            />
          </div>

          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
            {isLoginMode ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLoginMode ? "New user?" : "Already registered?"}
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="ml-2 text-indigo-600 font-bold"
          >
            {isLoginMode ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;