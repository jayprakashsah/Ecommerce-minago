const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController'); 
const verifyToken = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ ENSURE UPLOADS FOLDER EXISTS
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// --- MULTER SETUP ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'file-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// --- ROUTES ---

// 1. Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/social-login', authController.socialLogin);

// 2. Seller Registration Route
router.post(
    '/register-seller',
    upload.single('document'),
    authController.registerSeller
);

// 3. Profile Routes
router.get('/profile', verifyToken, authController.getProfile);
router.put(
    '/profile',
    verifyToken,
    upload.single('profileImage'),
    authController.updateProfile
);

// 4. Admin Routes
router.get('/admin/stats', verifyToken, adminController.getStats);
router.get('/admin/seller-requests', verifyToken, adminController.getSellerRequests);
router.put('/admin/approve-seller/:id', verifyToken, adminController.approveSeller);
router.delete('/admin/reject-seller/:id', verifyToken, adminController.rejectSeller);

module.exports = router;