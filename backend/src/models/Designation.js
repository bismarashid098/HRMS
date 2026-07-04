const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  grade: { type: String, maxlength: 20 },
  description: { type: String, maxlength: 500 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Designation", designationSchema);
