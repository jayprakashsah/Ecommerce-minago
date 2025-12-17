import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaPhone, FaMapMarkerAlt, FaCamera, FaSave, 
  FaHeadset, FaUserEdit, FaBoxOpen, FaShippingFast, FaUndo, FaFileContract, 
  FaUserTie, FaPaperPlane, FaCalendarAlt, FaMoneyBillWave, FaChartLine 
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL;

function Profile() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [activeTab, setActiveTab] = useState('orders'); 
  const [subSupportTab, setSubSupportTab] = useState('returns');

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: token }
      });

      const userData = res.data?.user || res.data;
      setUser(userData);

      if (userData?.role === 'admin') {
        setActiveTab('details');
      } else {
        setActiveTab('orders');
        fetchOrders();
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/my-orders`, {
        headers: { Authorization: token }
      });

      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
  };

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
    formData.append('email', user.email);
    formData.append('phone', user.phone);
    formData.append('address', user.address);
    if (imageFile) formData.append('profileImage', imageFile);

    try {
      await axios.put(`${API}/auth/profile`, formData, {
        headers: { Authorization: token }
      });
      alert("Profile Updated Successfully!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Update Failed.");
    }
  };

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    alert("Support Request created. We will contact you shortly.");
    setComplaint({ orderId: '', issue: '', message: '' });
  };

  if (loading) return <div className="text-center mt-20">Loading Profile...</div>;

  const isAdmin = user.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">

        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">

            <div className="p-6 text-center border-b bg-indigo-900 text-white">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 border-4 border-white">
                <img
                  src={previewImage || user.profileImage || "/no-image.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-lg">{user.username || "User"}</h3>
              <p className="text-xs text-indigo-300 uppercase">{user.role || "Customer"}</p>
            </div>

            <nav className="flex flex-col">
              {isAdmin && (
                <button onClick={() => navigate('/admin')} className="p-4 font-bold flex items-center gap-3 text-white bg-indigo-600">
                  <FaChartLine /> Admin Dashboard
                </button>
              )}

              {!isAdmin && (
                <button onClick={() => setActiveTab('orders')} className="p-4 font-bold flex items-center gap-3">
                  <FaBoxOpen /> My Orders
                  <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">
                    {orders.length}
                  </span>
                </button>
              )}

              <button onClick={() => setActiveTab('details')} className="p-4 font-bold flex items-center gap-3">
                <FaUserEdit /> Edit Profile
              </button>

              {!isAdmin && (
                <button onClick={() => setActiveTab('support')} className="p-4 font-bold flex items-center gap-3">
                  <FaHeadset /> Help & Support
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full md:w-3/4">

          {/* ORDERS */}
          {activeTab === 'orders' && !isAdmin && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white p-10 text-center rounded-2xl">
                  <FaBoxOpen className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p>No orders found.</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border">
                    <p className="font-bold">Order #{order._id}</p>

                    {Array.isArray(order.products) && order.products.map((item, idx) => (
                      <div key={idx} className="flex gap-4 mt-4">
                        <img src={item.product?.image || "/no-image.png"} className="w-16 h-16 object-cover" />
                        <div>
                          <p className="font-bold">{item.product?.title}</p>
                          <p>Qty: {item.quantity}</p>
                        </div>
                        <div className="ml-auto font-bold">${item.price}</div>
                      </div>
                    ))}

                    <div className="mt-4 font-bold flex justify-between">
                      <span>Total</span>
                      <span>${order.totalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROFILE */}
          {activeTab === 'details' && (
            <form onSubmit={handleUpdate} className="bg-white p-8 rounded-2xl shadow-sm">
              <input name="username" value={user.username} onChange={handleChange} />
              <input name="phone" value={user.phone} onChange={handleChange} />
              <input name="address" value={user.address} onChange={handleChange} />
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl mt-4">
                <FaSave /> Save
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;