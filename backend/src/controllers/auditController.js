const asyncHandler = require("express-async-handler");
const AuditLog = require("../models/AuditLog");

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private/Admin
exports.getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });
  res.json(logs);
});

// @desc    Create an audit log
// @route   POST /api/audit-logs
// @access  Private (Internal use mostly)
exports.createAuditLog = asyncHandler(async (req, res) => {
  const { action, details } = req.body;
  
  const log = await AuditLog.create({
    user: req.user._id,
    action,
    details,
    ip: req.ip
  });

  res.status(201).json(log);
});
