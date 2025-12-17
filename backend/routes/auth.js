const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController'); 
const verifyToken = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- MULTER SETUP ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, 'file-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/social-login', authController.socialLogin); // <--- SOCIAL LOGIN

// 2. Seller Registration Route (Public)
// uses 'document' field for the ID proof upload
router.post('/register-seller', upload.single('document'), authController.registerSeller); // <--- SELLER REGISTRATION

// 3. Profile Routes (Protected)
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', 
    verifyToken, 
    upload.single('profileImage'), 
    authController.updateProfile
);

// 4. ADMIN ROUTES (Protected)
router.get('/admin/stats', verifyToken, adminController.getStats);
router.get('/admin/seller-requests', verifyToken, adminController.getSellerRequests); // <--- VIEW REQUESTS
router.put('/admin/approve-seller/:id', verifyToken, adminController.approveSeller);  // <--- APPROVE
router.delete('/admin/reject-seller/:id', verifyToken, adminController.rejectSeller); // <--- REJECT

module.exports = router;