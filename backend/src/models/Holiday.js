const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  date: { type: Date, required: true },
  endDate: { type: Date }, // for multi-day holidays
  type: {
    type: String,
    enum: ["Public", "Restricted", "Optional"],
    default: "Public"
  },
  description: { type: String, maxlength: 500 },
  year: { type: Number, required: true },
  isRecurring: { type: Boolean, default: false } // yearly repeat
}, { timestamps: true });

holidaySchema.index({ date: 1, year: 1 });

module.exports = mongoose.model("Holiday", holidaySchema);
