const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    type: {
      type: String,
      enum: ["Casual", "Sick", "Annual", "Maternity", "Paternity", "Unpaid"],
      required: true
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    paid: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    reason: String
  },
  { timestamps: true }
);

leaveSchema.index({ employee: 1, fromDate: 1 });
leaveSchema.index({ status: 1 });

module.exports = mongoose.model("Leave", leaveSchema);
