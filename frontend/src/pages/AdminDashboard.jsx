import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaBox, FaUsers, FaChartLine, FaClipboardList, 
  FaStore, FaShoppingBag, FaMoneyBillWave, FaUserShield, FaBars, FaTimes,
  FaCheck, FaEye, FaPlus
} from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import AddProductForm from '../components/AddProductForm';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
const API = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role"); // <--- GET ROLE
  
  // --- STATE ---
  // Default tab: Sellers go to 'products', Admins go to 'overview'
  const [activeTab, setActiveTab] = useState(role === 'seller' ? 'products' : 'overview');

  const [stats, setStats] = useState({ 
    totalUsers: 0, totalSellers: 0, totalAdmins: 0,
    totalProducts: 0, totalOrders: 0, ordersToday: 0, 
    totalRevenue: 0, salesData: [], recentOrders: [], allOrders: []
  });
  
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Admin Only State
  const [requests, setRequests] = useState([]); 
  const [preview, setPreview] = useState(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchProducts();
    // Only fetch Seller Requests if user is Admin
    if (role === 'admin') {
      fetchRequests();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      // DYNAMIC URL: Admin gets global stats, Seller gets isolated stats
      const url = role === 'admin' 
        ? '${API}/auth/admin/stats'
        : '${API}/auth/seller/stats';

      const res = await axios.get(url, { headers: { Authorization: token } });
      setStats(res.data);
    } catch (err) { 
      console.error("Stats error", err); 
      // If error (like 400 Bad Request due to old token), maybe logout or show alert
      if (err.response && err.response.status === 400) {
        alert("Session invalid. Please logout and login again.");
      }
    }
  };

  const fetchProducts = async () => {
    try {
      // DYNAMIC URL: Admin sees all, Seller sees theirs
      const endpoint = role === 'admin' 
        ? '${API}/products' 
        : '${API}/products/seller/my-products';
        
      const res = await axios.get(endpoint, { headers: { Authorization: token } });
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get('${API}/auth/admin/seller-requests', { headers: { Authorization: token } });
      setRequests(res.data);
    } catch (err) { console.error("Requests error", err); }
  };

  // --- ACTIONS ---
  const handleAction = async (id, action) => {
    const url = action === 'accept' 
      ? `${API}/auth/admin/approve-seller/${id}`
      : `${API}/auth/admin/reject-seller/${id}`;
    try {
      if(action === 'accept') await axios.put(url, {}, { headers: { Authorization: token } });
      else await axios.delete(url, { headers: { Authorization: token } });
      alert(`Seller ${action}ed!`);
      fetchRequests(); 
    } catch (err) { alert("Action Failed"); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, { headers: { Authorization: token } });
      setProducts(products.filter(p => p._id !== id));
      // Update stats locally
      setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
    } catch (error) { alert("Failed to delete."); }
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (editingProduct) {
        const res = await axios.put(`${API}/products/${editingProduct._id}`, formData, { headers: { Authorization: token } });
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
        setEditingProduct(null);
      } else {
        const newProduct = { ...formData, stars: 5, sale: "Just Added" };
        const res = await axios.post('${API}/products', newProduct, { headers: { Authorization: token } });
        setProducts([...products, res.data]);
        setStats(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
      }
    } catch (error) { alert("Failed to save."); }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- UI HELPER: Cards ---
  const renderStatCards = () => {
    // Cards visible to everyone (Sellers see their own data, Admins see global)
    const commonCards = [
      { label: role === 'admin' ? 'Total Revenue' : 'My Revenue', val: `$${(stats.totalRevenue || 0).toLocaleString()}`, icon: <FaMoneyBillWave />, color: 'green' },
      { label: role === 'admin' ? 'Total Orders' : 'My Orders', val: stats.totalOrders || 0, icon: <FaClipboardList />, color: 'blue' },
      { label: role === 'admin' ? 'Total Products' : 'My Products', val: stats.totalProducts || 0, icon: <FaBox />, color: 'indigo' },
    ];

    // Cards visible ONLY to Admin
    const adminCards = [
      { label: 'Customers', val: stats.totalUsers || 0, icon: <FaUsers />, color: 'orange' },
      { label: 'Sellers', val: stats.totalSellers || 0, icon: <FaStore />, color: 'purple' },
      { label: 'Admins', val: stats.totalAdmins || 0, icon: <FaUserShield />, color: 'red' },
    ];

    const cardsToShow = role === 'admin' ? [...commonCards, ...adminCards] : commonCards;

    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${role === 'admin' ? 'xl:grid-cols-6' : ''} gap-4 md:gap-6`}>
        {cardsToShow.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase">{item.label}</p>
                  <h3 className="text-xl font-bold text-gray-800 mt-1">{item.val}</h3>
               </div>
               <div className={`p-2 bg-${item.color}-50 rounded-lg text-${item.color}-600`}>{item.icon}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans relative">
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 text-2xl font-bold flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-2"><FaStore /> {role === 'seller' ? 'Seller Hub' : 'Admin Panel'}</div>
          <button className="md:hidden text-indigo-300" onClick={() => setIsSidebarOpen(false)}><FaTimes /></button>
        </div>
        
        <nav className="mt-6">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-indigo-800 transition ${activeTab === 'overview' ? 'bg-indigo-800 border-r-4 border-indigo-400' : ''}`}>
            <FaChartLine /> Dashboard
          </button>
          
          <button onClick={() => setActiveTab('products')} className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-indigo-800 transition ${activeTab === 'products' ? 'bg-indigo-800 border-r-4 border-indigo-400' : ''}`}>
            <FaBox /> Products
          </button>

          <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-indigo-800 transition ${activeTab === 'orders' ? 'bg-indigo-800 border-r-4 border-indigo-400' : ''}`}>
            <FaClipboardList /> Orders
          </button>

          {/* Users Tab - ADMIN ONLY */}
          {role === 'admin' && (
            <button onClick={() => setActiveTab('users')} className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-indigo-800 transition ${activeTab === 'users' ? 'bg-indigo-800 border-r-4 border-indigo-400' : ''}`}>
              <FaUsers /> User Management
            </button>
          )}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden">
        
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-2xl text-gray-700 p-2 bg-white rounded-lg shadow-sm" onClick={() => setIsSidebarOpen(true)}><FaBars /></button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize">{activeTab}</h1>
              <p className="text-gray-400 text-xs md:text-sm">{role === 'seller' ? 'Manage your personal inventory' : 'Overview of entire marketplace'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm pr-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 uppercase">{role === 'admin' ? 'SA' : 'SE'}</div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-800 capitalize">{role}</p>
              <p className="text-xs text-green-500 font-bold">● Online</p>
            </div>
          </div>
        </header>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {renderStatCards()}

            {/* GRAPH & RECENT ORDERS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend</h3>
                
                {/* --- CHART FIX: WRAPPER + CONDITION --- */}
                <div style={{ width: '100%', height: 300 }}>
                  {stats.salesData && stats.salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.salesData}>
                        <defs>
                           <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      No sales data available to display.
                    </div>
                  )}
                </div>
                {/* -------------------------------------- */}

              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Sales</h3>
                <div className="space-y-4">
                  {stats.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                             {order.user ? order.user.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 truncate w-24 md:w-auto">{order.user}</p>
                            <p className="text-xs text-gray-400">{order.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">${order.amount}</p>
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getStatusColor(order.status)}`}>{order.status}</span>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-gray-400 text-center text-sm py-4">No recent sales found.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm mb-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaPlus /> Add New Product</h2>
              <AddProductForm 
                onAdd={handleSaveProduct} 
                initialData={editingProduct}
                isEditing={!!editingProduct}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
            
            <h2 className="text-xl font-bold mb-4 text-gray-800">
               {role === 'admin' ? 'All Marketplace Products' : 'My Products'}
            </h2>

            {products.length === 0 ? (
                 <div className="text-center py-10 text-gray-400">No products found. Start Selling!</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(prod => (
                    <div key={prod._id}>
                        <ProductCard product={prod} userRole={role} onEdit={setEditingProduct} onDelete={handleDeleteProduct} />
                    </div>
                ))}
                </div>
            )}
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {role === 'admin' ? 'All Platform Orders' : 'My Product Orders'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">{role === 'admin' ? 'Total Amount' : 'My Earnings'}</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Handle both data structures (Top 5 vs All) */}
                  {(stats.allOrders || stats.recentOrders || []).map((order, idx) => (
                    <tr key={idx}>
                      <td className="p-4 text-sm font-bold text-indigo-600">{order.id}</td>
                      <td className="p-4 text-sm text-gray-700">{order.user}</td>
                      <td className="p-4 text-sm text-gray-500">{order.date}</td>
                      <td className="p-4 text-sm font-bold text-gray-800">${order.amount}</td>
                      <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(order.status)}`}>{order.status}</span></td>
                    </tr>
                  ))}
                  {(!stats.allOrders && !stats.recentOrders) || (stats.allOrders?.length === 0 && stats.recentOrders?.length === 0) ? (
                     <tr><td colSpan="5" className="p-8 text-center text-gray-400">No orders found.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- USERS TAB (ADMIN ONLY) --- */}
        {activeTab === 'users' && role === 'admin' && (
           <div className="space-y-8">
             {/* 1. User Summary Cards (Reused Logic) */}
             <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
                <FaUsers className="text-6xl mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-gray-700">User Management</h3>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
                  <div className="p-4 bg-orange-50 rounded-2xl"><p className="text-2xl font-bold text-orange-500">{stats.totalUsers}</p><p className="text-xs font-bold text-gray-500">Customers</p></div>
                  <div className="p-4 bg-purple-50 rounded-2xl"><p className="text-2xl font-bold text-purple-500">{stats.totalSellers}</p><p className="text-xs font-bold text-gray-500">Sellers</p></div>
                  <div className="p-4 bg-red-50 rounded-2xl"><p className="text-2xl font-bold text-red-500">{stats.totalAdmins}</p><p className="text-xs font-bold text-gray-500">Admins</p></div>
                </div>
            </div>

            {/* 2. Seller Requests Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><FaStore className="text-indigo-500"/> Pending Seller Requests ({requests.length})</h2>
                
                {requests.length === 0 ? <p className="text-gray-500 text-center py-6">No pending requests.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr><th className="p-4">Name</th><th className="p-4">Actions</th></tr>
                      </thead>
                      <tbody>
                        {requests.map(req => (
                          <tr key={req._id} className="border-b">
                            <td className="p-4 font-bold">{req.username}</td>
                            <td className="p-4 flex gap-2">
                                <button onClick={() => setPreview(req)} className="p-2 bg-blue-100 text-blue-600 rounded"><FaEye /></button>
                                <button onClick={() => handleAction(req._id, 'accept')} className="p-2 bg-green-100 text-green-600 rounded"><FaCheck /></button>
                                <button onClick={() => handleAction(req._id, 'reject')} className="p-2 bg-red-100 text-red-600 rounded"><FaTimes /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>
        )}

      </main>

      {/* --- PREVIEW MODAL --- */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full relative">
            <button onClick={() => setPreview(null)} className="absolute top-4 right-4 text-gray-400 font-bold text-2xl">&times;</button>
            <h3 className="text-xl font-bold mb-4">Seller Proof</h3>
            {preview.businessDetails?.documentProof ? 
              <img src={preview.businessDetails.documentProof} alt="Proof" className="w-full" /> : 
              <p>No document.</p>
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;