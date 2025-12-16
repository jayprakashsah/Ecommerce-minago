import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaSave, 
  FaHeadset, FaUserEdit, FaBoxOpen, FaShippingFast, FaUndo, FaFileContract, 
  FaUserTie, FaPaperPlane, FaCalendarAlt, FaMoneyBillWave, FaChartLine 
} from 'react-icons/fa';

function Profile() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('orders'); 
  const [subSupportTab, setSubSupportTab] = useState('returns');

  // Initialize with empty strings
  const [user, setUser] = useState({
    username: '', 
    email: '', 
    phone: '', 
    address: '', 
    profileImage: '', 
    role: ''
  });
  
  const [orders, setOrders] = useState([]); 
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [complaint, setComplaint] = useState({ orderId: '', issue: '', message: '' });

  // --- EFFECTS ---
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:3000/auth/profile', {
        headers: { Authorization: token }
      });
      
      if (res.data) {
          const userData = res.data.user || res.data;
          setUser(userData);

          if (userData.role === 'admin') {
            setActiveTab('details');
          } else {
            setActiveTab('orders');
            fetchOrders(); 
          }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:3000/orders/my-orders', { 
        headers: { Authorization: token } 
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // --- HANDLERS ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', user.username);
    // Even though we hid the input, we send the existing email back to be safe
    formData.append('email', user.email); 
    formData.append('phone', user.phone);
    formData.append('address', user.address);
    if (imageFile) formData.append('profileImage', imageFile);

    try {
      // --- FIX: REMOVED MANUAL 'Content-Type' HEADER ---
      // Axios sets this automatically with the correct boundary for FormData
      await axios.put('http://localhost:3000/auth/profile', formData, {
        headers: { Authorization: token } 
      });
      
      alert("Profile Updated Successfully!");
      fetchProfile(); // Re-fetch to confirm update

    } catch (err) {
      console.error(err);
      alert("Update Failed.");
    }
  };

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    alert(`Support Request created. We will contact you shortly.`);
    setComplaint({ orderId: '', issue: '', message: '' });
  };

  if (loading) return <div className="text-center mt-20">Loading Profile...</div>;
  if (!user) return <div className="text-center mt-20">Error loading profile.</div>;

  const isAdmin = user.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            
            <div className="p-6 text-center border-b border-gray-50 bg-indigo-900 text-white">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-700 border-4 border-white overflow-hidden mb-3">
                 <img 
                    src={previewImage || user.profileImage || "https://via.placeholder.com/150"} 
                    alt="Profile" 
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover" 
                 />
              </div>
              <h3 className="font-bold text-lg truncate">{user.username || 'User'}</h3>
              <p className="text-xs text-indigo-300 uppercase tracking-wider">{user.role || 'Customer'}</p>
            </div>

            <nav className="flex flex-col">
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin')} 
                  className="p-4 text-left font-bold flex items-center gap-3 text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  <FaChartLine /> Admin Dashboard
                </button>
              )}
              {!isAdmin && (
                <button 
                  onClick={() => setActiveTab('orders')} 
                  className={`p-4 text-left font-bold flex items-center gap-3 transition ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaBoxOpen /> My Orders
                  <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">{orders.length}</span>
                </button>
              )}
              <button 
                onClick={() => setActiveTab('details')} 
                className={`p-4 text-left font-bold flex items-center gap-3 transition ${activeTab === 'details' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FaUserEdit /> Edit Profile
              </button>
              {!isAdmin && (
                <button 
                  onClick={() => setActiveTab('support')} 
                  className={`p-4 text-left font-bold flex items-center gap-3 transition ${activeTab === 'support' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaHeadset /> Help & Support
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="w-full md:w-3/4">
          
          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && !isAdmin && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Order History</h2>
              {orders.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
                   <FaBoxOpen className="mx-auto text-4xl text-gray-300 mb-4" />
                   <p className="text-gray-500">You haven't placed any orders yet.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-gray-50">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Order ID</span>
                        <p className="font-bold text-gray-800 text-sm">#{order._id}</p>
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
                    <div className="space-y-4 mb-4">
                      {order.products.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                            {item.product ? (
                              <img src={item.product.image} alt="product" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm">
                              {item.product ? item.product.title : "Product Unavailable"}
                            </h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="font-bold text-indigo-600 text-sm">
                            ${item.product ? item.price : 0}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl mt-4">
                      <div><p className="text-xs text-gray-500">Payment</p><p className="text-sm font-bold text-gray-700">{order.paymentMethod || 'COD'}</p></div>
                      <div className="text-right"><p className="text-xs text-gray-500">Total</p><div className="flex items-center gap-2 text-xl font-bold text-gray-900"><FaMoneyBillWave className="text-green-500" />${order.totalAmount}</div></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === 'details' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Edit Profile</h2>
              <form onSubmit={handleUpdate} className="space-y-6">
                
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24">
                    <img src={previewImage || user.profileImage || "https://via.placeholder.com/150"} alt="Profile" crossOrigin="anonymous" className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-sm" />
                    <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-md">
                      <FaCamera size={14} />
                      <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700">Profile Photo</h3>
                    <p className="text-xs text-gray-400">Click the camera icon to update.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                      <input type="text" name="username" value={user.username || ''} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                  
                  {/* EMAIL FIELD HIDDEN/REMOVED */}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                      <input type="text" name="phone" value={user.phone || ''} onChange={handleChange} placeholder="+1 234 567 890" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Address</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                      <input type="text" name="address" value={user.address || ''} onChange={handleChange} placeholder="123 Main St, City" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2">
                  <FaSave /> Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: HELP & SUPPORT */}
          {activeTab === 'support' && !isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
              <div className="bg-gray-50 p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Help Center</h2>
                <p className="text-sm text-gray-500">Solve issues regarding orders, returns, and account.</p>
              </div>

              <div className="flex overflow-x-auto border-b border-gray-100">
                {[{ id: 'returns', icon: <FaUndo />, label: 'Returns' }, { id: 'shipping', icon: <FaShippingFast />, label: 'Shipping' }, { id: 'seller', icon: <FaUserTie />, label: 'Become Seller' }, { id: 'terms', icon: <FaFileContract />, label: 'T&C' }].map(tab => (
                  <button key={tab.id} onClick={() => setSubSupportTab(tab.id)} className={`flex-1 py-4 px-4 font-bold text-sm whitespace-nowrap flex items-center justify-center gap-2 transition ${subSupportTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}>{tab.icon} {tab.label}</button>
                ))}
              </div>

              <div className="p-8">
                {subSupportTab === 'returns' && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Return & Complaint Form</h3>
                    <form onSubmit={handleComplaintSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input value={complaint.orderId} onChange={e => setComplaint({...complaint, orderId: e.target.value})} placeholder="Order ID" className="w-full p-3 rounded-lg border border-gray-300" required />
                            <select value={complaint.issue} onChange={e => setComplaint({...complaint, issue: e.target.value})} className="w-full p-3 rounded-lg border border-gray-300"><option>Select Issue...</option><option>Damaged Item</option><option>Other</option></select>
                        </div>
                        <textarea value={complaint.message} onChange={e => setComplaint({...complaint, message: e.target.value})} placeholder="Describe problem..." rows="3" className="w-full p-3 rounded-lg border border-gray-300 mb-4" required></textarea>
                        <button type="submit" className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 flex items-center gap-2"><FaPaperPlane /> Submit</button>
                    </form>
                  </div>
                )}
                {/* Filler content */}
                {subSupportTab === 'shipping' && <p>Standard Delivery: 5-7 Days. Express: 1-2 Days.</p>}
                {subSupportTab === 'seller' && <p>Contact partners@minagoshop.com</p>}
                {subSupportTab === 'terms' && <p>Standard Terms & Conditions Apply.</p>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;