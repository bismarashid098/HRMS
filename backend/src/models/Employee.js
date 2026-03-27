const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    employeeId: {
      type: String,
      unique: true,
      trim: true
    },
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
    email: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      trim: true
    },
    dutyStartTime: {
      type: String,
      trim: true
    },
    religion: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    joiningDate: {
      type: Date
    },
    biometricId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    monthlyOffDays: {
      type: Number,
      default: 3
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
