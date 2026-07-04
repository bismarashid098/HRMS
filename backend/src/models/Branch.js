const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  code: { type: String, trim: true, maxlength: 20 },
  address: { type: String, maxlength: 300 },
  city: { type: String, maxlength: 100 },
  country: { type: String, maxlength: 100, default: "Pakistan" },
  phone: { type: String, maxlength: 20 },
  email: { type: String, maxlength: 100 },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
