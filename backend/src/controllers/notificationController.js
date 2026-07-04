const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { recipient: req.user._id };
  if (unreadOnly === "true") query.isRead = false;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user._id, isRead: false })
  ]);
  res.json({ notifications, total, unreadCount, page: parseInt(page), limit: parseInt(limit) });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!n) { res.status(404); throw new Error("Notification not found"); }

  n.isRead = true;
  n.readAt = new Date();
  await n.save();
  res.json(n);
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  res.json({ message: "All notifications marked as read" });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!n) { res.status(404); throw new Error("Notification not found"); }
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ message: "Notification deleted" });
});

// Internal helper — call this from other controllers to create notifications
const createNotification = async ({ recipient, title, message, type, refModel, refId, link }) => {
  try {
    await Notification.create({ recipient, title, message, type: type || "General", refModel, refId, link });
  } catch (err) {
    // Non-critical — log and continue
    console.error("Failed to create notification:", err.message);
  }
};

module.exports = {
  getMyNotifications: exports.getMyNotifications,
  markAsRead: exports.markAsRead,
  markAllRead: exports.markAllRead,
  deleteNotification: exports.deleteNotification,
  createNotification
};
