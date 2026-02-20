const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    salary: {
      type: Number,
      required: true
    },
    biometricId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    leaveBalance: {
      type: Number,
      default: 0
    },
    employmentStatus: {
      type: String,
      enum: ["Active", "Resigned", "Terminated"],
      default: "Active"
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model("Employee", employeeSchema);
