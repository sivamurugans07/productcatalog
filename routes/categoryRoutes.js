const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

// Get all categories with their products
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find();
        if (!categories.length) return res.status(404).json({ message: "No categories found" });

        const categoriesWithProducts = await Promise.all(
            categories.map(async (cat) => {
                const products = await Product.find({
                    category: { $regex: new RegExp(`^${cat.name}$`, "i") } // case-insensitive match
                });

                return {
                    _id: cat._id,
                    name: cat.name,
                    products
                };
            })
        );

        res.json(categoriesWithProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
