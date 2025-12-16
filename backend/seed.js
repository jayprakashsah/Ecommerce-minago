const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const initialProducts = [
  { id: 1, title: "Premium Relax Chair", image: "https://images.unsplash.com/photo-1588796388607-1b900451b12c?w=300&q=80", price: "120.00", oldPrice: "180.00" },
  { id: 2, title: "Sony Noise Cancelling", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80", price: "240.00", oldPrice: "300.00" },
  { id: 3, title: "Instax Mini 11", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&q=80", price: "89.00", oldPrice: "110.00" },
  { id: 4, title: "Apple Watch Series 6", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&q=80", price: "350.00", oldPrice: "400.00" }
];

const seedData = async () => {
    await connectDB();
    await Product.deleteMany({}); // Clear existing data to avoid duplicates
    await Product.insertMany(initialProducts);
    console.log("Data Inserted Successfully!");
    process.exit();
};

seedData();