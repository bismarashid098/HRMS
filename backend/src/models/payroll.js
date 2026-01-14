const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },

    basicSalary: { type: Number, required: true },
    allowance: { type: Number, default: 0 },

    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Generated", "Approved"],
      default: "Generated"
    }
  },
  { timestamps: true }
);

// one payroll per employee per month
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
