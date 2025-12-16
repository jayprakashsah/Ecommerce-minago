const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController'); // <--- 1. IMPORT THIS
const verifyToken = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- MULTER SETUP ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, 'user-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// 2. Profile Routes (Protected)
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', 
    verifyToken, 
    upload.single('profileImage'), 
    authController.updateProfile
);

// 3. ADMIN STATS ROUTE (This was missing!)
router.get('/admin/stats', verifyToken, adminController.getStats); // <--- 2. ADD THIS LINE

module.exports = router;