const mongoose = require("mongoose");

const jobPostingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  designation: { type: mongoose.Schema.Types.ObjectId, ref: "Designation" },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  description: { type: String, maxlength: 3000 },
  requirements: { type: String, maxlength: 2000 },
  vacancies: { type: Number, default: 1, min: 1 },
  employmentType: {
    type: String,
    enum: ["Full-Time", "Part-Time", "Contract", "Internship"],
    default: "Full-Time"
  },
  salaryMin: { type: Number, min: 0 },
  salaryMax: { type: Number, min: 0 },
  lastDate: { type: Date },
  status: {
    type: String,
    enum: ["Open", "Closed", "On Hold"],
    default: "Open"
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

jobPostingSchema.index({ status: 1, department: 1 });

module.exports = mongoose.model("JobPosting", jobPostingSchema);
