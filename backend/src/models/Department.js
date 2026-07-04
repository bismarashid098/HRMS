const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  code: { type: String, trim: true, maxlength: 20 },
  description: { type: String, maxlength: 500 },
  head: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// name unique index is defined on the field itself

module.exports = mongoose.model("Department", departmentSchema);
