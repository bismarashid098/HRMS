const Settings = require("../models/Settings");

/**
 * Get Settings
 * GET /api/settings
 */
exports.getSettings = async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  res.json(settings);
};

/**
 * Update Settings
 * PUT /api/settings
 */
exports.updateSettings = async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }

  res.json({ message: "Settings updated successfully", settings });
};
