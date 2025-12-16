const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // <--- IMPORTANT: Import Product Model
const verifyToken = require('../middlewares/authMiddleware');

// --- GET USER'S ORDERS ---
router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- CREATE ORDER & UPDATE STOCK ---
router.post('/', verifyToken, async (req, res) => {
    const { products, totalAmount, shippingAddress, paymentMethod, deliveryCharge } = req.body;
    
    try {
        // 1. CHECK STOCK AVAILABILITY FIRST
        // We loop through items to ensure they are all in stock before processing
        for (const item of products) {
            const productInDb = await Product.findById(item.product);
            if (!productInDb) {
                return res.status(404).json({ message: `Product not found` });
            }
            if (productInDb.quantity < item.quantity) {
                return res.status(400).json({ message: `Out of Stock: ${productInDb.title}` });
            }
        }

        // 2. CREATE THE ORDER
        const newOrder = new Order({
            user: req.user.id,
            products,
            totalAmount,
            shippingAddress,
            paymentMethod,
            deliveryCharge,
            status: 'Pending',
            isPaid: paymentMethod !== 'COD'
        });
        const savedOrder = await newOrder.save();

        // 3. UPDATE PRODUCT INVENTORY (DECREASE QUANTITY)
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity } // Subtracts the ordered qty
            });
        }

        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;