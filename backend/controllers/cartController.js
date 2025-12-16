const Cart = require('../models/Cart');

// GET CART (User Specific)
exports.getCart = async (req, res) => {
    try {
        // Find the cart for the LOGGED IN user
        // .populate(...) gets the actual product details (title, image, price)
        let cart = await Cart.findOne({ user: req.user.id }).populate('products.product');
        
        if (!cart) {
            return res.json([]); // Return empty array if no cart exists yet
        }
        res.json(cart.products); // Send only the products array to frontend
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADD TO CART
exports.addToCart = async (req, res) => {
    const { _id } = req.body; // Product ID from Frontend
    const userId = req.user.id; // User ID from Token

    try {
        let cart = await Cart.findOne({ user: userId });

        if (cart) {
            // Check if product exists in array
            const itemIndex = cart.products.findIndex(p => p.product == _id);

            if (itemIndex > -1) {
                // Product exists, update quantity
                cart.products[itemIndex].quantity += 1;
            } else {
                // Product does not exist, push to array
                cart.products.push({ product: _id, quantity: 1 });
            }
            await cart.save();
        } else {
            // No cart exists for user, create new one
            cart = await Cart.create({
                user: userId,
                products: [{ product: _id, quantity: 1 }]
            });
        }
        
        // Return updated list
        const fullCart = await Cart.findOne({ user: userId }).populate('products.product');
        res.json(fullCart.products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE QUANTITY
exports.updateQty = async (req, res) => {
    const { id } = req.params; // Product ID
    const { qty } = req.body;
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.products.findIndex(p => p.product == id);

        if (itemIndex > -1) {
            if (qty < 1) {
                // If qty is 0, remove item
                cart.products.splice(itemIndex, 1);
            } else {
                cart.products[itemIndex].quantity = qty;
            }
            await cart.save();
        }

        const fullCart = await Cart.findOne({ user: userId }).populate('products.product');
        res.json(fullCart.products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.id;

    try {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        // Filter out the item to delete
        cart.products = cart.products.filter(p => p.product != productId);
        
        await cart.save();

        const fullCart = await Cart.findOne({ user: userId }).populate('products.product');
        res.json(fullCart.products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CLEAR CART (Optional Helper)
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.id });
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};