import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaTruck, FaShieldAlt, FaEdit } from 'react-icons/fa';

function Checkout({ cart }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // 1. Determine Items (Buy Now vs Cart)
  const buyNowItem = location.state?.buyNowItem;
  const checkoutItems = buyNowItem ? [buyNowItem] : cart;

  // 2. Calculations
  const deliveryCharge = 100;
  const itemsTotal = checkoutItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const grandTotal = itemsTotal + deliveryCharge;

  // 3. State
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card'); // Default
  const [loading, setLoading] = useState(true);

  // 4. Fetch User Address on Load
  useEffect(() => {
    if (checkoutItems.length === 0) {
       // navigate('/'); // Uncomment to force redirect if empty
    }
 axios.get(`${API}/auth/profile`, { headers: { Authorization: token } })      .then(res => {
        setAddress(res.data.address || '');
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  // 5. Handle "Place Order"
  const handlePlaceOrder = async () => {
    if (!address.trim()) {
        alert("Please provide a delivery address.");
        return;
    }

    // Prepare Order Data object
    const orderData = {
        products: checkoutItems.map(item => ({
            product: item._id,
            quantity: item.qty || 1,
            price: item.price
        })),
        totalAmount: grandTotal,
        shippingAddress: address,
        paymentMethod: paymentMethod,
        deliveryCharge: deliveryCharge
    };

    if (paymentMethod === 'COD') {
        // --- CASH ON DELIVERY FLOW ---
        try {
await axios.post(`${API}/orders`, orderData, { headers: { Authorization: token } });
            alert("Order Placed Successfully!");
            navigate('/orders');
        } catch (error) {
            console.error(error);
            alert("Failed to place order.");
        }
    } else {
        // --- ONLINE PAYMENT FLOW (Redirect to Gateway) ---
        navigate('/payment-gateway', { state: { orderData } });
    }
  };

  if (checkoutItems.length === 0) return <div className="text-center mt-20">Cart is empty.</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          <FaShieldAlt className="text-indigo-600" /> Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN (Address & Options) --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. DELIVERY ADDRESS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                  Delivery Address
                </h2>
              </div>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows="3"
                  placeholder="Enter full address (Street, City, Zip Code)"
                />
                <p className="text-xs text-gray-400 mt-2">We will use this address for shipping.</p>
              </div>
            </div>

            {/* 2. PAYMENT METHOD */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                  Payment Method
                </h2>
                <div className="space-y-3">
                    {/* Card */}
                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'Card' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name="payment" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} className="accent-indigo-600 w-5 h-5" />
                        <div className="flex-1">
                            <span className="font-bold text-gray-800 block">Credit / Debit Card</span>
                            <span className="text-xs text-gray-500">Visa, Mastercard, RuPay</span>
                        </div>
                        <FaCreditCard className="text-xl text-gray-400" />
                    </label>

                    {/* UPI */}
                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'UPI' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name="payment" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="accent-indigo-600 w-5 h-5" />
                         <div className="flex-1">
                            <span className="font-bold text-gray-800 block">UPI</span>
                            <span className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</span>
                        </div>
                        <span className="font-bold text-gray-400">UPI</span>
                    </label>

                    {/* COD */}
                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-indigo-600 w-5 h-5" />
                        <div className="flex-1">
                            <span className="font-bold text-gray-800 block">Cash on Delivery</span>
                            <span className="text-xs text-gray-500">Pay when you receive</span>
                        </div>
                        <FaMoneyBillWave className="text-xl text-green-500" />
                    </label>
                </div>
            </div>

            {/* 3. ORDER ITEMS REVIEW */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs">3</span>
                  Review Items
                </h2>
                <div className="space-y-4">
                    {checkoutItems.map((item, idx) => (
                        <div key={idx} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <img src={item.image} alt="product" className="w-16 h-16 object-cover rounded-md bg-gray-100" />
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                <p className="text-xs text-gray-500">Qty: {item.qty || 1} x ${item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN (Sticky Summary) --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Price Details</h3>
                
                <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Price ({checkoutItems.length} items)</span>
                        <span>${itemsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Delivery Charges</span>
                        <span className="text-green-600 font-bold">+ ${deliveryCharge}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xl font-bold text-gray-900 mb-6">
                    <span>Total Payable</span>
                    <span>${grandTotal.toFixed(2)}</span>
                </div>

                <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg mb-6 flex items-center gap-2">
                    <FaTruck /> Estimated Delivery: by {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()}
                </div>

                <button 
                    onClick={handlePlaceOrder}
                    className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200"
                >
                    {paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Pay'}
                </button>

                <div className="text-center mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
                    <FaShieldAlt /> Safe and Secure Payments.
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;