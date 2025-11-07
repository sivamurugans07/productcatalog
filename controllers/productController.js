const Product = require('../models/productModel');

// GET /api/products?search=&category=&min=&max=&page=
const getProducts = async (req, res) => {
    try {
        const { search, category, min, max } = req.query;
        const query = {};
        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.category = category;
        if (min || max) query.price = {};
        if (min) query.price.$gte = Number(min);
        if (max) query.price.$lte = Number(max);

        const products = await Product.find(query).limit(100);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addProduct = async (req, res) => {
    try {
        const p = new Product(req.body);
        const saved = await p.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { getProducts, addProduct };
