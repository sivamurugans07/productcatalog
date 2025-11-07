const Category = require("../models/categoryModel");

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add new category
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = new Category({ name });
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { getCategories, addCategory };
