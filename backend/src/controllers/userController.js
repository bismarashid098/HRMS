const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === "true";
  if (search) {
    const re = new RegExp(escapeRegex(search), "i");
    query.$or = [{ name: re }, { email: re }];
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) { res.status(404); throw new Error("User not found"); }
  res.json(user);
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot change your own role" });
  }

  const { role } = req.body;
  const validRoles = ["Admin", "Manager"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${validRoles.join(", ")}` });
  }

  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }

  const oldRole = user.role;
  user.role = role;
  await user.save();

  logAudit(req, {
    module: "User",
    action: "Update",
    recordId: user._id,
    recordName: user.name,
    description: `${req.user?.name} changed ${user.name}'s role from ${oldRole} to ${role}`,
    oldValues: { role: oldRole },
    newValues: { role }
  });

  res.json({ message: "User role updated successfully" });
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot change your own account status" });
  }

  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }

  const wasActive = user.isActive;
  user.isActive = !user.isActive;
  await user.save();

  logAudit(req, {
    module: "User",
    action: "Update",
    recordId: user._id,
    recordName: user.name,
    description: `${req.user?.name} ${user.isActive ? "activated" : "deactivated"} user ${user.name}`,
    oldValues: { isActive: wasActive },
    newValues: { isActive: user.isActive }
  });

  res.json({ message: `User ${user.isActive ? "activated" : "deactivated"} successfully` });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot delete your own account" });
  }

  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }

  user.isActive = false;
  await user.save();

  logAudit(req, {
    module: "User",
    action: "Delete",
    recordId: user._id,
    recordName: user.name,
    description: `${req.user?.name} deactivated (soft-deleted) user ${user.name}`
  });

  res.json({ message: "User deactivated successfully" });
});
