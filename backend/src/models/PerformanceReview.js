const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 200 },
  target: { type: String, maxlength: 300 },
  achievement: { type: String, maxlength: 300 },
  weight: { type: Number, default: 1, min: 0 },
  score: { type: Number, min: 0, max: 10 }
}, { _id: false });

const performanceReviewSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  period: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  type: {
    type: String,
    enum: ["Annual", "Probation", "Mid-Year", "Quarterly"],
    default: "Annual"
  },
  kpis: [kpiSchema],
  overallScore: { type: Number, min: 0, max: 10 },
  rating: {
    type: String,
    enum: ["Exceptional", "Exceeds Expectations", "Meets Expectations", "Below Expectations", "Unsatisfactory"]
  },
  strengths: { type: String, maxlength: 1000 },
  improvements: { type: String, maxlength: 1000 },
  goals: { type: String, maxlength: 1000 },
  employeeComments: { type: String, maxlength: 1000 },
  status: {
    type: String,
    enum: ["Draft", "Submitted", "Acknowledged"],
    default: "Draft"
  }
}, { timestamps: true });

performanceReviewSchema.index({ employee: 1, "period.from": -1 });

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
