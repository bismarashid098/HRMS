const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  register,
  login,
  verify,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  unlockAccount
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const passwordRules = (field) =>
  body(field)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number");

router.post(
  "/register",
  protect,
  authorize("Admin"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  passwordRules("password"),
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
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  passwordRules("newPassword"),
  validateRequest,
  changePassword
);

router.put(
  "/profile",
  protect,
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  validateRequest,
  updateProfile
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Valid email is required"),
  validateRequest,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  validateRequest,
  resetPassword
);

router.put("/unlock/:id", protect, authorize("Admin"), unlockAccount);

module.exports = router;
