const asyncHandler = require("express-async-handler");
const PerformanceReview = require("../models/PerformanceReview");
const Employee = require("../models/Employee");
const { logAudit } = require("../services/auditService");

exports.getReviews = asyncHandler(async (req, res) => {
  const { employee, type, status, year, page = 1, limit = 20 } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (type) query.type = type;
  if (status) query.status = status;
  if (year) {
    const y = Number(year);
    query["period.from"] = { $gte: new Date(y, 0, 1) };
    query["period.to"] = { $lte: new Date(y, 11, 31) };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [reviews, total] = await Promise.all([
    PerformanceReview.find(query)
      .populate("employee", "name employeeId department designation")
      .populate("reviewedBy", "name")
      .sort({ "period.from": -1 })
      .skip(skip).limit(parseInt(limit)),
    PerformanceReview.countDocuments(query)
  ]);
  res.json({ reviews, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getReviewById = asyncHandler(async (req, res) => {
  const review = await PerformanceReview.findById(req.params.id)
    .populate("employee", "name employeeId department designation joiningDate")
    .populate("reviewedBy", "name");
  if (!review) { res.status(404); throw new Error("Performance review not found"); }
  res.json(review);
});

exports.createReview = asyncHandler(async (req, res) => {
  const { employee, reviewedBy, period, type, kpis, strengths, improvements, goals } = req.body;
  if (!employee) { res.status(400); throw new Error("Employee is required"); }
  if (!period?.from || !period?.to) { res.status(400); throw new Error("Review period (from/to) is required"); }

  const emp = await Employee.findById(employee);
  if (!emp) { res.status(404); throw new Error("Employee not found"); }

  const review = await PerformanceReview.create({
    employee,
    reviewedBy: reviewedBy || undefined,
    period: { from: new Date(period.from), to: new Date(period.to) },
    type,
    kpis: kpis || [],
    strengths,
    improvements,
    goals
  });

  logAudit(req, { module: "Performance", action: "Create", recordId: review._id, recordName: emp.name, description: `${req.user?.name} created performance review for ${emp.name}`, newValues: review.toObject() });

  res.status(201).json(review);
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await PerformanceReview.findById(req.params.id);
  if (!review) { res.status(404); throw new Error("Performance review not found"); }
  if (review.status === "Acknowledged") { res.status(400); throw new Error("Acknowledged reviews cannot be modified"); }

  const old = review.toObject();
  const fields = ["reviewedBy", "type", "kpis", "overallScore", "rating", "strengths", "improvements", "goals", "employeeComments", "status"];
  fields.forEach((f) => { if (req.body[f] !== undefined) review[f] = req.body[f]; });

  if (req.body.period) {
    if (req.body.period.from) review.period.from = new Date(req.body.period.from);
    if (req.body.period.to) review.period.to = new Date(req.body.period.to);
  }

  await review.save();
  logAudit(req, { module: "Performance", action: "Update", recordId: review._id, recordName: String(review.employee), description: `${req.user?.name} updated performance review`, oldValues: old, newValues: review.toObject() });

  res.json(review);
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await PerformanceReview.findById(req.params.id);
  if (!review) { res.status(404); throw new Error("Performance review not found"); }

  logAudit(req, { module: "Performance", action: "Delete", recordId: review._id, recordName: String(review.employee), description: `${req.user?.name} deleted performance review` });

  await PerformanceReview.findByIdAndDelete(req.params.id);
  res.json({ message: "Performance review deleted successfully" });
});
