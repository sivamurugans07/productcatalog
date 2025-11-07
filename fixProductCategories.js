const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/productModel");
const Category = require("./models/categoryModel");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/productCatalog";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

async function fixCategories() {
    try {
        const products = await Product.find();

        for (let product of products) {
            // If category is a string
            if (typeof product.category === "string") {
                const category = await Category.findOne({ name: product.category });

                if (category) {
                    product.category = category._id;
                    await product.save();
                    console.log(`✅ Updated product "${product.name}"`);
                } else {
                    console.log(`⚠️ Category not found for product "${product.name}"`);
                }
            }
        }

        console.log("All products updated!");
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

fixCategories();
