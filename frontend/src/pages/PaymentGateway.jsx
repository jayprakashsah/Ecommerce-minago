import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCircleNotch, FaLock } from 'react-icons/fa';

/* ✅ ONLY ADDITION */
const API = import.meta.env.VITE_API_URL;

function PaymentGateway() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderData } = location.state || {};

  useEffect(() => {
    if (!orderData) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      confirmOrder();
    }, 3000);

    return () => clearTimeout(timer);
  }, [orderData]);

  const confirmOrder = async () => {
    const token = sessionStorage.getItem("token");
    try {
      await axios.post(`${API}/orders`, orderData, {
        headers: { Authorization: token }
      });

      alert("Payment Successful! Order Placed.");
      navigate('/orders');
    } catch (error) {
      console.error(error);
      alert("Payment Failed. Please try again.");
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <FaLock className="text-4xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Secure Payment Gateway</h2>
        <p className="text-gray-500 mb-6">
          Processing payment of <span className="font-bold text-gray-900">${orderData?.totalAmount}</span>
        </p>

        <div className="flex justify-center mb-6">
          <FaCircleNotch className="animate-spin text-5xl text-indigo-600" />
        </div>

        <p className="text-sm text-gray-400 animate-pulse">Contacting Bank Server...</p>
        <p className="text-xs text-gray-300 mt-4">Do not refresh or close this page.</p>
      </div>
    </div>
  );
}

export default PaymentGateway;