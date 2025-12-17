import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBox, FaCalendarAlt, FaMoneyBillWave, FaArrowRight } from 'react-icons/fa';
const API = import.meta.env.VITE_API_URL;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    // Fetch logged-in user's orders
 axios.get(`${API}/orders/my-orders`, { 
        headers: { Authorization: token } 
    })
    .then(res => {
      setOrders(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <div className="text-center mt-20">Loading your orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't bought anything yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <FaBox className="text-indigo-600" /> My Orders
      </h2>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            
            {/* Header: ID, Date, Status */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-gray-50">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Order ID</span>
                <p className="font-bold text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FaCalendarAlt /> {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status || 'Pending'}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-4">
              {order.products.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {/* Handle if product was deleted */}
                    {item.product ? (
                      <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {item.product ? item.product.title : "Product Unavailable"}
                    </h4>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="ml-auto font-bold text-indigo-600">
                    ${item.product ? item.product.price : 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: Total */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-500">Total Amount</span>
              <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <FaMoneyBillWave className="text-green-500" />
                ${order.totalAmount}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;