const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true
    },
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 8 },
    annual: { type: Number, default: 14 },
    maternity: { type: Number, default: 90 },
    paternity: { type: Number, default: 3 },
    lastResetYear: { type: Number, default: () => new Date().getFullYear() }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
