const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load secrets from .env file (Fallback to hardcoded if .env fails, for safety)
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";

// --- 1. REGISTER (Username Logic) ---
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
            role: role || 'user'
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 2. LOGIN (Username Logic) ---
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

// --- 4. UPDATE PROFILE (With Image Fix) ---
exports.updateProfile = async (req, res) => {
    try {
        // 1. Get all text data from body
        let updateData = { ...req.body };

        // 2. If an image file was uploaded, add it to updateData
        if (req.file) {
            updateData.profileImage = `http://localhost:3000/uploads/${req.file.filename}`;
        }

        // 3. Update Database
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { $set: updateData },
            { new: true } 
        ).select('-password');

        res.json({ message: "Profile Updated", user: updatedUser });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- 5. SOCIAL LOGIN (NEW: Google/Facebook Logic) ---
exports.socialLogin = async (req, res) => {
    try {
        const { username, email, provider } = req.body;

        // 1. Check if user exists by Email
        // (We search by email because usernames from Google might overlap with existing ones)
        let user = await User.findOne({ email });

        if (!user) {
            // --- SCENARIO A: NEW USER (REGISTER) ---
            // Create a dummy password since they use Google to login
            // We hash the email + secret to create a unique, un-guessable password
            const dummyPassword = await bcrypt.hash(email + JWT_SECRET, 10);
            
            user = new User({
                username: username || email.split('@')[0], // Fallback to email prefix if no name
                email: email,
                password: dummyPassword,
                role: 'user', // Default role
                profileImage: "https://via.placeholder.com/150" // Default image
            });

            await user.save();
            console.log(`New ${provider} User Created: ${email}`);
        } else {
            // --- SCENARIO B: EXISTING USER (LOGIN) ---
            console.log(`Existing ${provider} User Logged In: ${email}`);
        }

        // 2. Generate Token (Same as standard login)
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRE } 
        );

        // 3. Send Success Response
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