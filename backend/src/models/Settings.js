const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    company: {
      name: String,
      address: String,
      email: String,
      phone: String
    },

    attendance: {
      workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" }
      },
      lateAfterMinutes: { type: Number, default: 15 },
      halfDayAfterMinutes: { type: Number, default: 240 },
      policy: {
        gracePeriod: { type: Number, default: 5 },
        deductionType: {
          type: String,
          enum: ["None", "Fixed", "Percentage", "PerMinute"],
          default: "None",
        },
        deductionValue: { type: Number, default: 0 },
      },
    },

    payroll: {
      taxPercentage: { type: Number, default: 5 },
      overtimeRatePerHour: { type: Number, default: 0 },
      monthlyOffDays: { type: Number, default: 3 }
    },

    currency: {
      code: { type: String, default: "PKR" },
      symbol: { type: String, default: "₨" }
    },

    advances: {
      limitType: { type: String, enum: ["PERCENTAGE", "FIXED"], default: "PERCENTAGE" },
      limitValue: { type: Number, default: 30 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
