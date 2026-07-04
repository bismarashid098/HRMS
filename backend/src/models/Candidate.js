const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  scheduledAt: { type: Date },
  interviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  type: { type: String, enum: ["Phone", "Video", "In-Person"], default: "In-Person" },
  result: { type: String, enum: ["Pending", "Pass", "Fail", "No Show"], default: "Pending" },
  notes: { type: String, maxlength: 1000 },
  round: { type: Number, default: 1 }
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: "JobPosting", required: true },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  email: { type: String, trim: true, maxlength: 150 },
  phone: { type: String, maxlength: 20 },
  cnic: { type: String, maxlength: 20 },
  resumeUrl: { type: String },
  source: {
    type: String,
    enum: ["LinkedIn", "Indeed", "Referral", "Walk-in", "Website", "Other"],
    default: "Other"
  },
  status: {
    type: String,
    enum: ["Applied", "Shortlisted", "Interviewed", "Offered", "Hired", "Rejected", "Withdrawn"],
    default: "Applied"
  },
  interviews: [interviewSchema],
  offerDate: { type: Date },
  joiningDate: { type: Date },
  notes: { type: String, maxlength: 1000 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

candidateSchema.index({ jobPosting: 1, status: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);
