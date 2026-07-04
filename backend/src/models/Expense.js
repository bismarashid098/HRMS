const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  category: {
    type: String,
    enum: ["Travel", "Food", "Accommodation", "Communication", "Office Supplies", "Training", "Medical", "Other"],
    default: "Other"
  },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: "PKR", maxlength: 5 },
  date: { type: Date, required: true },
  description: { type: String, maxlength: 1000 },
  receiptUrl: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Paid"],
    default: "Pending"
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  rejectionReason: { type: String, maxlength: 500 },
  paidAt: { type: Date },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

expenseSchema.index({ employee: 1, date: -1 });
expenseSchema.index({ status: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
