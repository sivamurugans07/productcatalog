const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
    let token;

    // ✅ Get token from Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request (excluding password)
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ error: "User not found" });
            }

            next();
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ error: "Unauthorized or token expired" });
        }
    }

    if (!token) {
        return res.status(401).json({ error: "No token, authorization denied" });
    }
};
