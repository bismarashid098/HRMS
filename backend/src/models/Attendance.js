const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: { type: Date, required: true },

    punchIn: { type: Date },
    punchOut: { type: Date },

    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Late",
        "Half Day",
        "Half Leave",
        "Full Leave",
        "Holiday",
        "Weekend",
        "Work From Home",
      ],
      default: "Present",
    },

    breakTime: { type: Number, default: 0 },
    workingHours: { type: Number, default: 0 },
    lateMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    deductionAmount: { type: Number, default: 0 },
    deductionReason: { type: String, default: "" },
    remarks: { type: String, default: "" },

    isLocked: { type: Boolean, default: false },

    correctionRequest: {
      requested: { type: Boolean, default: false },
      reason: String,
      approved: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
