import React from 'react';
import { FaTrash, FaCreditCard } from 'react-icons/fa';

function Cart({ cartItems, onUpdateQty, onRemove }) {
  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.qty), 0);
  const total = subtotal;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaCreditCard className="text-2xl" />
        </div>
        <p className="text-lg font-medium">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left: Items List */}
      <div className="lg:w-2/3 space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl flex gap-4 items-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center">
              <img src={item.image} alt={item.title} className="h-14 object-contain mix-blend-multiply" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
              <p className="text-indigo-600 font-bold mt-1">${item.price}</p>
            </div>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button onClick={() => onUpdateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition font-bold">-</button>
              <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
              <button onClick={() => onUpdateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition font-bold">+</button>
            </div>

            <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 transition p-2">
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      {/* Right: Summary */}
      <div className="lg:w-1/3">
        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-4">Order Summary</h3>
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Shipping</span>
              <span className="text-green-400">Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-700">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2">
            Checkout Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;