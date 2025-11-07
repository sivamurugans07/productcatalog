const express = require("express");
const router = express.Router();
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// Add item to cart
router.post("/add", async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Find or create cart for user
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [], totalPrice: 0 });
        }

        // Check if product already exists in cart
        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        // Recalculate total price
        const total = await Promise.all(
            cart.items.map(async (item) => {
                const prod = await Product.findById(item.product);
                return prod.price * item.quantity;
            })
        );
        cart.totalPrice = total.reduce((sum, price) => sum + price, 0);

        await cart.save();
        res.status(200).json({ message: "Added to cart successfully", cart });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's cart
router.get("/:userId", async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate("items.product");
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove product from cart
router.delete("/:userId/:productId", async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        // Recalculate total
        const total = await Promise.all(
            cart.items.map(async (item) => {
                const prod = await Product.findById(item.product);
                return prod.price * item.quantity;
            })
        );
        cart.totalPrice = total.reduce((sum, price) => sum + price, 0);

        await cart.save();
        res.json({ message: "Product removed from cart", cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
