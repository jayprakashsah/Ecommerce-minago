const express = require('express');
const router = express.Router();

// Import the Controller (where the logic lives now)
const productController = require('../controllers/productController');

// Import Middleware (to protect the route)
const verifyToken = require('../middlewares/authMiddleware');

// GET /products 
// (Public: Anyone can see products)
router.get('/', productController.getAllProducts);

// POST /products 
// (Protected: Only logged-in users with a token can add products)
router.post('/', verifyToken, productController.createProduct);


// ... imports ...
// ... existing routes ...

// UPDATE (Protected)
router.put('/:id', verifyToken, productController.updateProduct);

// DELETE (Protected)
router.delete('/:id', verifyToken, productController.deleteProduct);


module.exports = router;