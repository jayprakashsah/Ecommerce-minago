const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getStats = async (req, res) => {
    try {
        // --- STRICT SEPARATION OF ROLES ---
        
        // 1. Total Customers (role: 'user')
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        // 2. Total Sellers (role: 'seller')
        const totalSellers = await User.countDocuments({ role: 'seller' });

        // 3. Total Admins (role: 'admin')
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // --- REVENUE ---
        const revenueAgg = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // --- ORDERS TODAY ---
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const ordersToday = await Order.countDocuments({ 
            createdAt: { $gte: startOfDay } 
        });

        // --- RECENT ORDERS ---
        const recentOrdersRaw = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'username');

        const recentOrders = recentOrdersRaw.map(order => ({
            id: order._id.toString().slice(-6).toUpperCase(),
            user: order.user ? order.user.username : 'Unknown',
            amount: order.totalAmount,
            status: order.status,
            date: new Date(order.createdAt).toLocaleDateString()
        }));

        // --- GRAPH DATA ---
        const salesData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            const dailySales = await Order.aggregate([
                { $match: { createdAt: { $gte: date, $lt: nextDay } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]);
            salesData.push({
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                sales: dailySales.length > 0 ? dailySales[0].total : 0
            });
        }

        res.json({
            totalUsers,
            totalSellers, // New separate count
            totalAdmins,  // New separate count
            totalProducts,
            totalOrders,
            ordersToday,
            totalRevenue,
            salesData,
            recentOrders
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};