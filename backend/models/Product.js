const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    
    // --- UPDATED IMAGES LOGIC ---
    // 1. Array for multiple images
    images: { 
        type: [String], 
        required: true,
        default: [] 
    },
    // 2. Keep this for backward compatibility with your old data
    image: { type: String }, 

    stars: { type: Number, default: 5 },
    sale: { type: String },
    quantity: { type: Number, required: true, default: 10 },
    description: { type: String, default: "No description available." }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);