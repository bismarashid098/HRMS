const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, default: "System" },
    userRole: { type: String, default: "System" },
    module: {
      type: String,
      required: true,
      enum: ["Employee", "Attendance", "Leave", "Payroll", "Advance", "Auth", "Settings", "User", "Biometric", "Department", "Designation", "Branch", "Shift", "Holiday", "Recruitment", "Performance", "Training", "Asset", "Expense", "Document", "Notification"]
    },
    action: {
      type: String,
      required: true,
      enum: ["Create", "Update", "Edit", "Delete", "Login", "Logout", "Failed Login", "Password Change", "Profile Update", "Approve", "Reject", "Import", "Generate", "Export", "Assign", "Return", "Enroll", "Cancel"]
    },
    recordId: { type: String },
    recordName: { type: String },
    description: { type: String, required: true },
    oldValues: { type: mongoose.Schema.Types.Mixed },
    newValues: { type: mongoose.Schema.Types.Mixed },
    changedFields: [{ type: String }],
    ip: { type: String },
    userAgent: { type: String },
    browser: { type: String },
    os: { type: String },
    device: { type: String }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ userRole: 1 });
// Auto-delete audit logs after 1 year
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
