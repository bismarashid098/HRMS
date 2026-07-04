const asyncHandler = require("express-async-handler");
const Training = require("../models/Training");
const Employee = require("../models/Employee");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getTrainings = asyncHandler(async (req, res) => {
  const { status, type, department, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (department) query.department = department;
  if (search) query.title = new RegExp(escapeRegex(search), "i");

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [trainings, total] = await Promise.all([
    Training.find(query)
      .populate("department", "name")
      .populate("createdBy", "name")
      .sort({ startDate: -1 })
      .skip(skip).limit(parseInt(limit)),
    Training.countDocuments(query)
  ]);
  res.json({ trainings, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getTrainingById = asyncHandler(async (req, res) => {
  const t = await Training.findById(req.params.id)
    .populate("department", "name")
    .populate("enrollments.employee", "name employeeId department");
  if (!t) { res.status(404); throw new Error("Training not found"); }
  res.json(t);
});

exports.createTraining = asyncHandler(async (req, res) => {
  const { title, description, type, trainer, venue, startDate, endDate, duration, cost, maxParticipants, department } = req.body;
  if (!title) { res.status(400); throw new Error("Title is required"); }

  const training = await Training.create({
    title: title.trim(), description, type, trainer, venue,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    duration, cost, maxParticipants, department,
    createdBy: req.user._id
  });

  logAudit(req, { module: "Training", action: "Create", recordId: training._id, recordName: training.title, description: `${req.user?.name} created training: ${training.title}`, newValues: training.toObject() });

  res.status(201).json(training);
});

exports.updateTraining = asyncHandler(async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) { res.status(404); throw new Error("Training not found"); }

  const old = t.toObject();
  const fields = ["title", "description", "type", "trainer", "venue", "duration", "cost", "maxParticipants", "department", "status"];
  fields.forEach((f) => { if (req.body[f] !== undefined) t[f] = req.body[f]; });
  if (req.body.startDate) t.startDate = new Date(req.body.startDate);
  if (req.body.endDate) t.endDate = new Date(req.body.endDate);

  await t.save();
  logAudit(req, { module: "Training", action: "Update", recordId: t._id, recordName: t.title, description: `${req.user?.name} updated training: ${t.title}`, oldValues: old, newValues: t.toObject() });

  res.json(t);
});

exports.enrollEmployee = asyncHandler(async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) { res.status(404); throw new Error("Training not found"); }
  if (t.status === "Completed" || t.status === "Cancelled") { res.status(400); throw new Error("Cannot enroll in a completed or cancelled training"); }

  const { employeeId } = req.body;
  if (!employeeId) { res.status(400); throw new Error("Employee ID is required"); }

  const emp = await Employee.findById(employeeId);
  if (!emp) { res.status(404); throw new Error("Employee not found"); }

  const alreadyEnrolled = t.enrollments.some((e) => e.employee.toString() === employeeId);
  if (alreadyEnrolled) { res.status(409); throw new Error("Employee is already enrolled"); }

  if (t.maxParticipants && t.enrollments.length >= t.maxParticipants) {
    res.status(400); throw new Error("Training is full");
  }

  t.enrollments.push({ employee: employeeId });
  await t.save();

  logAudit(req, { module: "Training", action: "Enroll", recordId: t._id, recordName: t.title, description: `${req.user?.name} enrolled ${emp.name} in ${t.title}` });

  res.json(t);
});

exports.updateEnrollment = asyncHandler(async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) { res.status(404); throw new Error("Training not found"); }

  const enrollment = t.enrollments.find((e) => e.employee.toString() === req.params.employeeId);
  if (!enrollment) { res.status(404); throw new Error("Enrollment not found"); }

  const { status, score, completionDate, certificateUrl } = req.body;
  if (status) enrollment.status = status;
  if (score !== undefined) enrollment.score = Number(score);
  if (completionDate) enrollment.completionDate = new Date(completionDate);
  if (certificateUrl !== undefined) enrollment.certificateUrl = certificateUrl;

  await t.save();
  res.json(t);
});

exports.deleteTraining = asyncHandler(async (req, res) => {
  const t = await Training.findById(req.params.id);
  if (!t) { res.status(404); throw new Error("Training not found"); }

  logAudit(req, { module: "Training", action: "Delete", recordId: t._id, recordName: t.title, description: `${req.user?.name} deleted training: ${t.title}` });

  await Training.findByIdAndDelete(req.params.id);
  res.json({ message: "Training deleted successfully" });
});
