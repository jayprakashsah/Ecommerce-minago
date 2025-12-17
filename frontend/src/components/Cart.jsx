import React from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. Import Hook
import { FaTrash, FaCreditCard, FaArrowRight } from 'react-icons/fa';

function Cart({ cartItems, onUpdateQty, onRemove }) {
  const navigate = useNavigate(); // <--- 2. Initialize Hook

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * (item.qty || 1)), 0);
  const total = subtotal;

  // --- 3. HANDLE CHECKOUT ---
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    // Navigate to the checkout page we fixed earlier
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200 m-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FaCreditCard className="text-3xl text-gray-300" />
        </div>
        <p className="text-xl font-bold text-gray-500">Your cart is empty</p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-6 text-indigo-600 font-bold hover:underline"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Items List */}
        <div className="lg:w-2/3 space-y-4">
          {cartItems.map((item) => (
            // NOTE: Used item._id because MongoDB uses _id
            <div key={item._id || item.id} className="bg-white p-4 rounded-2xl flex gap-4 items-center shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center p-2">
                <img src={item.image} alt={item.title} className="h-full w-full object-contain mix-blend-multiply" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg mb-1">{item.title}</h4>
                <p className="text-indigo-600 font-bold text-lg">${item.price}</p>
              </div>

              {/* Qty Controls */}
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                <button 
                  onClick={() => onUpdateQty(item._id || item.id, -1)} 
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-l-xl transition font-bold text-lg"
                >-</button>
                <span className="w-10 text-center font-bold text-gray-800">{item.qty || 1}</span>
                <button 
                  onClick={() => onUpdateQty(item._id || item.id, 1)} 
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-r-xl transition font-bold text-lg"
                >+</button>
              </div>

              <button 
                onClick={() => onRemove(item._id || item.id)} 
                className="text-gray-400 hover:text-red-500 transition p-3 hover:bg-red-50 rounded-xl"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg sticky top-24">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex justify-between text-2xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* --- FIXED CHECKOUT BUTTON --- */}
            <button 
              onClick={handleCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              Checkout Now <FaArrowRight />
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
               <FaCreditCard /> Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;