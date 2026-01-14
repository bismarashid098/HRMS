const User = require("../models/User");

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin
 */
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Admin
 */
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

/**
 * @desc    Update user role
 * @route   PUT /api/users/:id/role
 * @access  Admin
 */
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ message: "User not found" });

  user.role = role;
  await user.save();

  res.json({ message: "User role updated successfully" });
};

/**
 * @desc    Activate / Deactivate user
 * @route   PUT /api/users/:id/status
 * @access  Admin
 */
exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ message: "User not found" });

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    message: `User ${
      user.isActive ? "activated" : "deactivated"
    } successfully`
  });
};

/**
 * @desc    Soft delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ message: "User not found" });

  user.isActive = false;
  await user.save();

  res.json({ message: "User soft deleted successfully" });
};
