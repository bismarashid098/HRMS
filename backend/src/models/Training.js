const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  enrolledAt: { type: Date, default: Date.now },
  completionDate: { type: Date },
  status: {
    type: String,
    enum: ["Enrolled", "In Progress", "Completed", "Cancelled"],
    default: "Enrolled"
  },
  score: { type: Number, min: 0, max: 100 },
  certificateUrl: { type: String }
}, { _id: false });

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  type: {
    type: String,
    enum: ["Internal", "External", "Online", "Workshop", "Seminar"],
    default: "Internal"
  },
  trainer: { type: String, maxlength: 150 },
  venue: { type: String, maxlength: 200 },
  startDate: { type: Date },
  endDate: { type: Date },
  duration: { type: Number, min: 0 }, // hours
  cost: { type: Number, min: 0 },
  maxParticipants: { type: Number, min: 1 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  status: {
    type: String,
    enum: ["Planned", "Ongoing", "Completed", "Cancelled"],
    default: "Planned"
  },
  enrollments: [enrollmentSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

trainingSchema.index({ status: 1, startDate: -1 });

module.exports = mongoose.model("Training", trainingSchema);
