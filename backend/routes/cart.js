const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const verifyToken = require('../middlewares/authMiddleware'); // Import Auth Middleware

// All routes are now protected
router.get('/', verifyToken, cartController.getCart);
router.post('/', verifyToken, cartController.addToCart);
router.put('/:id', verifyToken, cartController.updateQty);
router.delete('/:id', verifyToken, cartController.deleteItem);
router.delete('/clear/all', verifyToken, cartController.clearCart);

module.exports = router;