const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    employeeId: {
      type: String,
      required: true,
      unique: true
    },

    department: {
      type: String,
      required: true
    },

    designation: {
      type: String,
      required: true
    },

    joiningDate: {
      type: Date,
      required: true
    },

    employmentStatus: {
      type: String,
      enum: ["Active", "Resigned", "Terminated"],
      default: "Active"
    },

    salary: {
      basic: { type: Number, required: true },
      allowance: { type: Number, default: 0 }
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
