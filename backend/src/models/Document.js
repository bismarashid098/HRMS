const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  type: {
    type: String,
    enum: [
      "CNIC", "Passport", "Degree", "Experience Letter", "Contract",
      "Offer Letter", "Warning Letter", "Policy", "Other"
    ],
    default: "Other"
  },
  fileUrl: { type: String, required: true },
  fileName: { type: String, maxlength: 250 },
  fileSize: { type: Number },
  mimeType: { type: String, maxlength: 100 },
  expiryDate: { type: Date },
  isSharedWithEmployee: { type: Boolean, default: false },
  notes: { type: String, maxlength: 500 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

documentSchema.index({ employee: 1, type: 1 });

module.exports = mongoose.model("Document", documentSchema);
