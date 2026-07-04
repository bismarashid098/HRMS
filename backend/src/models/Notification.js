const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 1000 },
  type: {
    type: String,
    enum: ["Leave", "Attendance", "Payroll", "Advance", "Asset", "Expense", "Training", "Performance", "General"],
    default: "General"
  },
  refModel: { type: String },
  refId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  link: { type: String, maxlength: 300 }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90-day TTL

module.exports = mongoose.model("Notification", notificationSchema);
