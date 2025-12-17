const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load secrets from .env file
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";

// ✅ ADD THIS (ONLY ADDITION)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// --- 1. REGISTER ---
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword, 
            role: role || 'user',
            profileImage: `https://ui-avatars.com/api/?name=${username}&background=random`
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 2. LOGIN ---
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRE } 
        );
        
        res.json({ 
            token, 
            role: user.role, 
            username: user.username,
            message: "Login successful" 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 3. GET PROFILE ---
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
    try {
        let updateData = { ...req.body };

        Object.keys(updateData).forEach(key => {
            if (
                updateData[key] === 'undefined' ||
                updateData[key] === '' ||
                updateData[key] === null
            ) {
                delete updateData[key];
            }
        });

        // ✅ ONLY FIX HERE
        if (req.file) {
            updateData.profileImage = `${BASE_URL}/uploads/${req.file.filename}`;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { $set: updateData },
            { new: true } 
        ).select('-password');

        res.json({ message: "Profile Updated", user: updatedUser });
    } catch (error) {
        console.error("Update Error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                message: "This email or username is already taken."
            });
        }

        res.status(500).json({ message: error.message });
    }
};

// --- 5. SOCIAL LOGIN ---
exports.socialLogin = async (req, res) => {
    try {
        const { username, email, provider } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required for social login" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            let finalUsername = username || email.split('@')[0];
            const checkUsername = await User.findOne({ username: finalUsername });
            if (checkUsername) {
                finalUsername = `${finalUsername}${Math.floor(1000 + Math.random() * 9000)}`;
            }

            const dummyPassword = await bcrypt.hash(email + JWT_SECRET, 10);
            
            user = new User({
                username: finalUsername,
                email,
                password: dummyPassword,
                role: 'user',
                profileImage: `https://ui-avatars.com/api/?name=${finalUsername}&background=random`
            });

            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRE } 
        );

        res.json({ 
            token, 
            role: user.role, 
            username: user.username,
            message: `${provider} Login Successful` 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 6. REGISTER SELLER ---
exports.registerSeller = async (req, res) => {
    try {
        const {
            username, email, password,
            phone, businessName,
            gstNumber, shopAddress
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already registered" });

        const existingUsername = await User.findOne({ username });
        if (existingUsername)
            return res.status(400).json({ message: "Username already taken" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let documentUrl = "";
        // ✅ ONLY FIX HERE
        if (req.file) {
            documentUrl = `${BASE_URL}/uploads/${req.file.filename}`;
        }

        const newSeller = new User({
            username,
            email,
            password: hashedPassword,
            role: 'seller',
            phone,
            businessDetails: {
                businessName,
                gstNumber,
                shopAddress,
                documentProof: documentUrl,
                isVerified: false
            }
        });

        await newSeller.save();
        res.status(201).json({
            message: "Seller Application Submitted successfully. Waiting for verification."
        });

    } catch (err) {
        console.error("Seller Reg Error:", err);
        res.status(500).json({ message: err.message });
    }
};