const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const multer = require("multer");
const path = require("path");


// ---------------- Multer setup for image upload ----------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // make sure 'uploads' folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    },
});


const upload = multer({ storage });


// ---------------- Add a new product ----------------
router.post("/", upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, price, category, description, isFeatured, discount } = req.body;


        // Images
        const images = req.files["images"] ? req.files["images"].map(f => f.filename) : [];


        // Video
        const video = req.files["video"] ? req.files["video"][0].filename : null;


        const newProduct = new Product({
            name,
            price,
            category,
            description,
            discount,
            isFeatured,
            images,
            video, // add this
        });


        await newProduct.save();
        res.status(201).json({ message: "✅ Product added successfully", product: newProduct });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: error.message });
    }
});


// ---------------- Get all products ----------------
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();


        // Add uniform categoryName field
        const mappedProducts = products.map((p) => ({
            ...p._doc,
            categoryName: p.category || "Uncategorized",
        }));


        res.json(mappedProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ---------------- Get products by category ----------------
router.get("/category/:categoryName", async (req, res) => {
    try {
        const categoryName = req.params.categoryName;
        const products = await Product.find({
            category: { $regex: new RegExp(categoryName, "i") }
        });
        res.json(products);
    } catch (error) {
        console.error("Error fetching by category:", error);
        res.status(500).json({ error: error.message });
    }
});



// ---------------- Get featured products ----------------
router.get("/featured", async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ---------------- Get single product by ID ----------------
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;