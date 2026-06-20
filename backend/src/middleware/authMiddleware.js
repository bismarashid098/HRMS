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

        if (decoded.role) {
            // New token: payload has role/name/email — no DB call needed
            req.user = { _id: decoded.id, id: decoded.id, role: decoded.role, name: decoded.name, email: decoded.email };
        } else {
            // Old token (id only): fall back to DB until user re-logs in
            req.user = await User.findById(decoded.id).select("-password");
        }
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});

module.exports = protect;
