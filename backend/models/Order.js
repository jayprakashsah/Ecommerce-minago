const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        price: { type: Number } // Store price at time of purchase
    }],
    totalAmount: { type: Number, required: true },
    
    // --- NEW FIELDS ---
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, required: true }, // e.g., "Card", "UPI", "COD"
    deliveryCharge: { type: Number, default: 100 },
    isPaid: { type: Boolean, default: false },
    
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);