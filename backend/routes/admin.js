// If adding to routes/auth.js
const adminController = require('../controllers/adminController');

// Add this route
router.get('/admin/stats', verifyToken, adminController.getStats);