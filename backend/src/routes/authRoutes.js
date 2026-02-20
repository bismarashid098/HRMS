const express = require("express");
const { body, validationResult } = require("express-validator");
const {
    register,
    login,
    verify,
    changePassword,
    updateProfile
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post(
    "/register",
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    validateRequest,
    register
);

router.post(
    "/login",
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
    login
);

router.get("/verify", protect, verify);

router.put(
    "/change-password",
    protect,
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters"),
    validateRequest,
    changePassword
);

router.put(
    "/profile",
    protect,
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("email")
        .optional()
        .isEmail()
        .withMessage("Valid email is required"),
    validateRequest,
    updateProfile
);

module.exports = router;
