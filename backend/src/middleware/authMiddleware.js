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

    // Always fetch from DB so role changes and deactivations take effect immediately
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    if (!user.isActive) {
      res.status(401);
      throw new Error("Account is deactivated");
    }

    if (user.isLocked) {
      res.status(401);
      throw new Error("Account is temporarily locked due to too many failed login attempts");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
    throw error;
  }
});

module.exports = protect;
