const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
    if (!req.headers.authorization?.startsWith("Bearer")) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});

module.exports = protect;
