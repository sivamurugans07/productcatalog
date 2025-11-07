const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    discount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    images: [{ type: String }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // ✅ important
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
