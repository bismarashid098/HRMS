const crypto = require("crypto");
const User = require("../models/User");
const Employee = require("../models/Employee");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("express-async-handler");
const { logAudit } = require("../services/auditService");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === "Admin" ? "Admin" : "Manager"
  });

  logAudit(req, {
    module: "User",
    action: "Create",
    recordId: user._id,
    recordName: user.name,
    description: `${req.user?.name} created user ${user.name} (${user.role})`
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user)
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Check if account is locked
  if (user.isLocked) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
    res.status(423);
    throw new Error(`Account is locked. Try again in ${minutesLeft} minute(s).`);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    logAudit(req, {
      module: "Auth",
      action: "Failed Login",
      recordId: user._id,
      recordName: user.name,
      description: `Failed login attempt for ${email} (attempt ${user.failedLoginAttempts})`,
      userOverride: { _id: user._id, name: user.name, role: user.role }
    });
    const attemptsLeft = Math.max(0, 5 - user.failedLoginAttempts);
    res.status(401);
    throw new Error(attemptsLeft > 0 ? `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.` : "Invalid credentials. Account is now locked for 15 minutes.");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Account is deactivated. Contact your administrator.");
  }

  await user.resetLoginAttempts();

  const employee = await Employee.findOne({ user: user._id });

  logAudit(req, {
    module: "Auth",
    action: "Login",
    recordId: user._id,
    recordName: user.name,
    description: `${user.name} (${user.role}) logged in`,
    userOverride: { _id: user._id, name: user.name, role: user.role }
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    employeeId: employee ? employee._id : null,
    token: generateToken(user)
  });
});

exports.verify = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const employee = await Employee.findOne({ user: user._id });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    employeeId: employee ? employee._id : null
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  logAudit(req, {
    module: "Auth",
    action: "Password Change",
    recordId: user._id,
    recordName: user.name,
    description: `${user.name} changed their password`
  });

  res.json({ message: "Password updated successfully" });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const oldValues = { name: user.name, email: user.email };

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = email;
  }

  if (name) user.name = name;

  await user.save();

  logAudit(req, {
    module: "Auth",
    action: "Profile Update",
    recordId: user._id,
    recordName: user.name,
    description: `${user.name} updated their profile`,
    oldValues,
    newValues: { name: user.name, email: user.email }
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return 200 to prevent email enumeration
  if (!user) {
    return res.json({ message: "If that email exists, a reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save();

  // In production: send via email using nodemailer
  // For now, return token directly (development only)
  const isDev = process.env.NODE_ENV !== "production";

  logAudit(req, {
    module: "Auth",
    action: "Password Change",
    recordId: user._id,
    recordName: user.name,
    description: `Password reset requested for ${email}`
  });

  res.json({
    message: "Password reset token generated. Configure SMTP in .env to send via email.",
    ...(isDev && { resetToken, note: "Token returned only in development mode" })
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.passwordChangedAt = new Date();
  await user.save();

  logAudit(req, {
    module: "Auth",
    action: "Password Change",
    recordId: user._id,
    recordName: user.name,
    description: `Password reset completed for ${user.email}`
  });

  res.json({ message: "Password reset successful. Please login with your new password." });
});

exports.unlockAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  logAudit(req, {
    module: "User",
    action: "Update",
    recordId: user._id,
    recordName: user.name,
    description: `${req.user?.name} unlocked account for ${user.name}`
  });

  res.json({ message: "Account unlocked successfully" });
});
