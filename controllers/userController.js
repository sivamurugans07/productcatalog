const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ------------------ Register ------------------
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
            token,
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
};

// ------------------ Login ------------------
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
};

// ------------------ Get Profile ------------------
const getUserProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized or token expired" });

        res.json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        });
    } catch (err) {
        console.error("Profile error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Export all functions properly
module.exports = { registerUser, loginUser, getUserProfile };
