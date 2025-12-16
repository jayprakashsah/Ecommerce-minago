const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    // Store a REFERENCE to the Product Model
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    qty: { type: Number, default: 1 }
});

module.exports = mongoose.model('CartItem', cartItemSchema);