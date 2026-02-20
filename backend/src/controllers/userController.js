const User = require("../models/User");
const asyncHandler = require("express-async-handler");

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Admin
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

/**
 * @desc    Update user role
 * @route   PUT /api/users/:id/role
 * @access  Admin
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;
  await user.save();

  res.json({ message: "User role updated successfully" });
});

/**
 * @desc    Activate / Deactivate user
 * @route   PUT /api/users/:id/status
 * @access  Admin
 */
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    message: `User ${
      user.isActive ? "activated" : "deactivated"
    } successfully`
  });
});

/**
 * @desc    Soft delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isActive = false;
  await user.save();

  res.json({ message: "User soft deleted successfully" });
});
