require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- SERVE IMAGES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- IMPORT ROUTES ---
// 1. Auth
const authRoutes = require('./routes/auth');

// 2. Products (Using 'products' with an 's' based on your previous error)
const productRoutes = require('./routes/products'); 

// 3. Cart (This is the one that was missing!)
const cartRoutes = require('./routes/cart');

// 4. Orders
const orderRoutes = require('./routes/order');

// --- USE ROUTES ---
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes); // Now this will work because cartRoutes is defined above
app.use('/orders', orderRoutes);

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log("DB Connection Error:", err));

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));