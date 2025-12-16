const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    
    // --- ADDED THIS FIELD ---
    // sparse: true allows multiple users to have no email (if they registered the old way)
    // unique: true ensures no two people have the same email
    email: { type: String, unique: true, sparse: true }, 

    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // 'user' or 'admin'
    
    // --- ADMIN / SELLER SPECIFIC ---
    adminType: { 
        type: String, 
        enum: ['super_admin', 'seller'], 
        default: 'seller' 
    },
    businessDetails: {
        businessName: { type: String, default: "" },
        gstNumber: { type: String, default: "" },
        shopAddress: { type: String, default: "" },
        isVerified: { type: Boolean, default: false } // Super Admin must verify new sellers
    },

    // --- USER PROFILE ---
    profileImage: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    houseNo: { type: String, default: "" },
    landmark: { type: String, default: "" },
    city: { type: String, default: "" },
    zip: { type: String, default: "" },
    
    // --- PAYMENT ---
    paymentType: { type: String, default: "card" },
    upiId: { type: String, default: "" },
    cardNumber: { type: String, default: "" },
    cardExpiry: { type: String, default: "" },
    cardCvv: { type: String, default: "" }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('User', userSchema);