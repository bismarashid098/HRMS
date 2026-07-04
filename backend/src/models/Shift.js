const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  startTime: { type: String, required: true }, // HH:MM
  endTime: { type: String, required: true },   // HH:MM
  gracePeriod: { type: Number, default: 10, min: 0 }, // minutes
  workingDays: {
    type: [String],
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  overtimeEnabled: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Shift", shiftSchema);
