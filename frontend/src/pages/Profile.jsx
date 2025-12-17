import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserEdit,
  FaBoxOpen,
  FaHeadset,
  FaSave,
  FaCamera,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaPaperPlane,
} from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

export default function Profile() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  const [user, setUser] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
    role: "",
  });

  const [orders, setOrders] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [supportMessage, setSupportMessage] = useState("");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: token },
      });

      const userData = res.data.user || res.data;
      setUser(userData);

      if (userData.role !== "admin") {
        fetchOrders();
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/my-orders`, {
        headers: { Authorization: token },
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= HANDLERS ================= */
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", user.username);
    formData.append("email", user.email);
    formData.append("phone", user.phone);
    formData.append("address", user.address);
    if (imageFile) formData.append("profileImage", imageFile);

    try {
      await axios.put(`${API}/auth/profile`, formData, {
        headers: { Authorization: token },
      });
      alert("Profile updated successfully");
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Profile update failed");
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    alert("Support request submitted. Our team will contact you.");
    setSupportMessage("");
  };

  if (loading) {
    return <div className="text-center mt-20">Loading profile...</div>;
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* SIDEBAR */}
          <aside className="md:col-span-1 bg-white rounded-2xl shadow border">
            <div className="p-6 text-center border-b">
              <img
                src={previewImage || user.profileImage || "https://via.placeholder.com/150"}
                alt="profile"
                className="w-24 h-24 mx-auto rounded-full object-cover border"
              />
              <h3 className="mt-4 font-bold text-lg">{user.username}</h3>
              <p className="text-xs text-gray-500 uppercase">{user.role}</p>
            </div>

            <nav className="flex flex-col">
              {!isAdmin && (
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`px-6 py-4 text-left font-medium flex items-center gap-3 ${
                    activeTab === "orders" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-50"
                  }`}
                >
                  <FaBoxOpen /> My Orders
                </button>
              )}

              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-4 text-left font-medium flex items-center gap-3 ${
                  activeTab === "profile" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-50"
                }`}
              >
                <FaUserEdit /> Edit Profile
              </button>

              {!isAdmin && (
                <button
                  onClick={() => setActiveTab("support")}
                  className={`px-6 py-4 text-left font-medium flex items-center gap-3 ${
                    activeTab === "support" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-50"
                  }`}
                >
                  <FaHeadset /> Help & Support
                </button>
              )}
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="md:col-span-3">

            {/* ORDERS */}
            {activeTab === "orders" && !isAdmin && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">My Orders</h2>

                {orders.length === 0 ? (
                  <div className="bg-white p-10 rounded-xl text-center border">
                    <FaBoxOpen className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">You have not placed any orders yet.</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-xl p-6 border shadow-sm">
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="font-bold">#{order._id.slice(-6)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FaCalendarAlt />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {order.products.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span>{item.product?.title}</span>
                          <span>${item.price}</span>
                        </div>
                      ))}

                      <div className="flex justify-between items-center mt-4 font-bold">
                        <span>Total</span>
                        <span className="flex items-center gap-1 text-green-600">
                          <FaMoneyBillWave /> {order.totalAmount}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* EDIT PROFILE */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl p-8 border shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={previewImage || user.profileImage || "https://via.placeholder.com/150"}
                        className="w-24 h-24 rounded-full object-cover border"
                      />
                      <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer">
                        <FaCamera size={14} />
                        <input type="file" className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      name="username"
                      value={user.username}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="border p-3 rounded-lg"
                    />
                    <input
                      name="phone"
                      value={user.phone}
                      onChange={handleChange}
                      placeholder="Phone"
                      className="border p-3 rounded-lg"
                    />
                    <input
                      name="address"
                      value={user.address}
                      onChange={handleChange}
                      placeholder="Address"
                      className="border p-3 rounded-lg md:col-span-2"
                    />
                  </div>

                  <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                    <FaSave /> Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* SUPPORT */}
            {activeTab === "support" && !isAdmin && (
              <div className="bg-white rounded-xl p-8 border shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Help & Support</h2>

                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <textarea
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    rows="4"
                    placeholder="Describe your issue"
                    className="w-full border rounded-lg p-3"
                    required
                  />

                  <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                    <FaPaperPlane /> Submit Request
                  </button>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
