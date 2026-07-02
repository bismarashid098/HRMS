const asyncHandler = require("express-async-handler");
const Settings = require("../models/Settings");
const { logAudit } = require("../services/auditService");

/**
 * Get Settings
 * GET /api/settings
 */
exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  res.json(settings);
});

/**
 * Update Settings
 * PUT /api/settings
 */
exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  const oldValues = settings ? settings.toObject() : {};

  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }

  logAudit(req, {
    module: "Settings",
    action: "Update",
    recordName: "System Settings",
    description: `${req.user?.name} updated system settings`,
    oldValues,
    newValues: settings.toObject(),
  });

  res.json({ message: "Settings updated successfully", settings });
});
