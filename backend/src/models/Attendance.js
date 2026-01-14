const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    punchIn: {
      type: Date
    },

    punchOut: {
      type: Date
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half Day"],
      default: "Present"
    },

    isLocked: {
      type: Boolean,
      default: false
    },

    correctionRequest: {
      requested: { type: Boolean, default: false },
      reason: String,
      approved: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// One attendance per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
