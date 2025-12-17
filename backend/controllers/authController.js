const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load secrets from .env file (Fallback to hardcoded if .env fails, for safety)
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";

// --- 1. REGISTER ---
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword, 
            role: role || 'user',
            // Use UI Avatars for a nice default image based on username
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

        // 1. Find User by USERNAME
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Validate Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // 3. Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRE } 
        );
        
        // 4. Send Response
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

// --- 4. UPDATE PROFILE (With Data Cleaning) ---
exports.updateProfile = async (req, res) => {
    try {
        // 1. Get all text data from body
        let updateData = { ...req.body };

        // 2. CLEAN DATA: Remove keys that are "undefined", null, or empty string
        // This prevents the "Duplicate Key" crash on email
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === 'undefined' || updateData[key] === '' || updateData[key] === null) {
                delete updateData[key];
            }
        });

        // 3. If an image file was uploaded, add it to updateData
        if (req.file) {
            updateData.profileImage = `http://localhost:3000/uploads/${req.file.filename}`;
        }

        // 4. Update Database
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { $set: updateData },
            { new: true } 
        ).select('-password');

        res.json({ message: "Profile Updated", user: updatedUser });
    } catch (error) {
        console.error("Update Error:", error);
        
        // Handle Duplicate Key Error Gracefully
        if (error.code === 11000) {
            return res.status(400).json({ message: "This email or username is already taken." });
        }
        
        res.status(500).json({ message: error.message });
    }
};

// --- 5. SOCIAL LOGIN (With CORS-Safe Image) ---
exports.socialLogin = async (req, res) => {
    try {
        const { username, email, provider } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required for social login" });
        }

        // 1. Check if user exists by Email
        let user = await User.findOne({ email });

        if (!user) {
            // --- NEW USER ---
            let finalUsername = username || email.split('@')[0];
            const checkUsername = await User.findOne({ username: finalUsername });
            if (checkUsername) {
                finalUsername = `${finalUsername}${Math.floor(1000 + Math.random() * 9000)}`;
            }

            // Create Dummy Password
            const dummyPassword = await bcrypt.hash(email + JWT_SECRET, 10);
            
            user = new User({
                username: finalUsername,
                email: email,
                password: dummyPassword,
                role: 'user',
                // FIX: Use UI Avatars instead of placeholder.com to stop CORS errors
                profileImage: `https://ui-avatars.com/api/?name=${finalUsername}&background=random`
            });

            await user.save();
            console.log(`New ${provider} User Created: ${finalUsername}`);
        } else {
            console.log(`Existing ${provider} User Logged In: ${user.username}`);
        }

        // 2. Generate Token
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
        console.error("Social Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- 6. REGISTER SELLER ---
exports.registerSeller = async (req, res) => {
    try {
        const { username, email, password, phone, businessName, gstNumber, shopAddress } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ message: "Username already taken" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let documentUrl = "";
        if (req.file) {
            documentUrl = `http://localhost:3000/uploads/${req.file.filename}`;
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
        res.status(201).json({ message: "Seller Application Submitted successfully. Waiting for verification." });

    } catch (err) {
        console.error("Seller Reg Error:", err);
        res.status(500).json({ message: err.message });
    }
};