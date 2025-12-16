import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaBox, FaUsers, FaChartLine, FaClipboardList, 
  FaStore, FaShoppingBag, FaMoneyBillWave, FaUserTie, FaUserShield, FaBars, FaTimes 
} from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import AddProductForm from '../components/AddProductForm';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

function AdminDashboard() {
  const token = sessionStorage.getItem("token");
  
  // --- STATE ---
  const [stats, setStats] = useState({ 
    totalUsers: 0, totalSellers: 0, totalAdmins: 0,
    totalProducts: 0, totalOrders: 0, ordersToday: 0, 
    totalRevenue: 0, salesData: [], recentOrders: [] 
  });
  
  const [activeTab, setActiveTab] = useState('overview'); 
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // --- MOBILE SIDEBAR STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchProducts();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:3000/auth/admin/stats', { headers: { Authorization: token } });
      setStats(res.data);
    } catch (err) { console.error("Stats error", err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/products');
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:3000/products/${id}`, { headers: { Authorization: token } });
      setProducts(products.filter(p => p._id !== id));
      setStats({ ...stats, totalProducts: stats.totalProducts - 1 });
    } catch (error) { alert("Failed to delete."); }
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (editingProduct) {
        const res = await axios.put(`http://localhost:3000/products/${editingProduct._id}`, formData, { headers: { Authorization: token } });
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
        setEditingProduct(null);
      } else {
        const newProduct = { ...formData, stars: 5, sale: "Just Added" };
        const res = await axios.post('http://localhost:3000/products', newProduct, { headers: { Authorization: token } });
        setProducts([...products, res.data]);
        setStats({ ...stats, totalProducts: stats.totalProducts + 1 });
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

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans relative">
      
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 text-2xl font-bold flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-2">
             <FaStore /> Admin
          </div>
          <button className="md:hidden text-indigo-300" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        
        <nav className="mt-6">
          {['overview', 'products', 'orders', 'users'].map((tab) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }} 
              className={`w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-indigo-800 transition capitalize ${activeTab === tab ? 'bg-indigo-800 border-r-4 border-indigo-400' : ''}`}
            >
              {tab === 'overview' && <FaChartLine />}
              {tab === 'products' && <FaBox />}
              {tab === 'orders' && <FaClipboardList />}
              {tab === 'users' && <FaUsers />}
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-2xl text-gray-700 p-2 bg-white rounded-lg shadow-sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize">{activeTab}</h1>
              <p className="text-gray-400 text-xs md:text-sm">Welcome back, Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm pr-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">SA</div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-800">Super Admin</p>
              <p className="text-xs text-green-500 font-bold">● Online</p>
            </div>
          </div>
        </header>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
              {[
                { label: 'Revenue', val: `$${stats.totalRevenue.toLocaleString()}`, icon: <FaMoneyBillWave />, color: 'green' },
                { label: 'Orders', val: stats.ordersToday, icon: <FaShoppingBag />, color: 'blue' },
                { label: 'Products', val: stats.totalProducts, icon: <FaBox />, color: 'indigo' },
                { label: 'Customers', val: stats.totalUsers, icon: <FaUsers />, color: 'orange' },
                { label: 'Sellers', val: stats.totalSellers, icon: <FaStore />, color: 'purple' },
                { label: 'Admins', val: stats.totalAdmins, icon: <FaUserShield />, color: 'red' },
              ].map((item, idx) => (
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

            {/* GRAPH & RECENT ORDERS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Sales Overview</h3>
                
                {/* --- FIX: Using inline styles (width: 100%, height: 300px) solves the "width(-1)" error --- */}
                <div style={{ width: '100%', height: 300 }}>
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
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Orders</h3>
                <div className="space-y-4">
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                             {order.user ? order.user.charAt(0) : '?'}
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
                  ) : <p className="text-gray-400 text-center">No orders yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm mb-8 border border-gray-100">
              <AddProductForm 
                onAdd={handleSaveProduct} 
                initialData={editingProduct}
                isEditing={!!editingProduct}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map(prod => (
                <div key={prod._id}>
                    <ProductCard product={prod} userRole="admin" onEdit={setEditingProduct} onDelete={handleDeleteProduct} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Order History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentOrders.map((order, idx) => (
                    <tr key={idx}>
                      <td className="p-4 text-sm font-bold text-indigo-600">{order.id}</td>
                      <td className="p-4 text-sm text-gray-700">{order.user}</td>
                      <td className="p-4 text-sm text-gray-500">{order.date}</td>
                      <td className="p-4 text-sm font-bold text-gray-800">${order.amount}</td>
                      <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(order.status)}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
           <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
            <FaUsers className="text-6xl mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold">User Management</h3>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="p-4 bg-orange-50 rounded-2xl"><p className="text-2xl font-bold text-orange-500">{stats.totalUsers}</p><p className="text-xs font-bold text-gray-500">Customers</p></div>
              <div className="p-4 bg-purple-50 rounded-2xl"><p className="text-2xl font-bold text-purple-500">{stats.totalSellers}</p><p className="text-xs font-bold text-gray-500">Sellers</p></div>
              <div className="p-4 bg-red-50 rounded-2xl"><p className="text-2xl font-bold text-red-500">{stats.totalAdmins}</p><p className="text-xs font-bold text-gray-500">Admins</p></div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;