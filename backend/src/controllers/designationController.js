const asyncHandler = require("express-async-handler");
const Designation = require("../models/Designation");
const Employee = require("../models/Employee");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getDesignations = asyncHandler(async (req, res) => {
  const { search, department, isActive, page = 1, limit = 50 } = req.query;
  const query = {};
  if (isActive !== undefined) query.isActive = isActive === "true";
  if (department) query.department = department;
  if (search) query.title = new RegExp(escapeRegex(search), "i");

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [designations, total] = await Promise.all([
    Designation.find(query).populate("department", "name").sort({ title: 1 }).skip(skip).limit(parseInt(limit)),
    Designation.countDocuments(query)
  ]);
  res.json({ designations, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getDesignationById = asyncHandler(async (req, res) => {
  const d = await Designation.findById(req.params.id).populate("department", "name");
  if (!d) { res.status(404); throw new Error("Designation not found"); }
  res.json(d);
});

exports.createDesignation = asyncHandler(async (req, res) => {
  const { title, department, grade, description } = req.body;
  if (!title) { res.status(400); throw new Error("Title is required"); }

  const existing = await Designation.findOne({ title: new RegExp(`^${escapeRegex(title)}$`, "i") });
  if (existing) { res.status(409); throw new Error("Designation with this title already exists"); }

  const desig = await Designation.create({ title: title.trim(), department: department || undefined, grade, description });

  logAudit(req, { module: "Designation", action: "Create", recordId: desig._id, recordName: desig.title, description: `${req.user?.name} created designation ${desig.title}`, newValues: desig.toObject() });

  res.status(201).json(desig);
});

exports.updateDesignation = asyncHandler(async (req, res) => {
  const d = await Designation.findById(req.params.id);
  if (!d) { res.status(404); throw new Error("Designation not found"); }

  const { title, department, grade, description, isActive } = req.body;
  const old = d.toObject();

  if (title !== undefined) {
    const clash = await Designation.findOne({ title: new RegExp(`^${escapeRegex(title)}$`, "i"), _id: { $ne: d._id } });
    if (clash) { res.status(409); throw new Error("Another designation with this title exists"); }
    d.title = title.trim();
  }
  if (department !== undefined) d.department = department || null;
  if (grade !== undefined) d.grade = grade;
  if (description !== undefined) d.description = description;
  if (isActive !== undefined) d.isActive = Boolean(isActive);

  await d.save();
  logAudit(req, { module: "Designation", action: "Update", recordId: d._id, recordName: d.title, description: `${req.user?.name} updated designation ${d.title}`, oldValues: old, newValues: d.toObject() });

  res.json(d);
});

exports.deleteDesignation = asyncHandler(async (req, res) => {
  const d = await Designation.findById(req.params.id);
  if (!d) { res.status(404); throw new Error("Designation not found"); }

  const empCount = await Employee.countDocuments({ designation: d.title, isDeleted: { $ne: true } });
  if (empCount > 0) { res.status(400); throw new Error(`Cannot delete: ${empCount} active employee(s) hold this designation`); }

  logAudit(req, { module: "Designation", action: "Delete", recordId: d._id, recordName: d.title, description: `${req.user?.name} deleted designation ${d.title}` });

  await Designation.findByIdAndDelete(req.params.id);
  res.json({ message: "Designation deleted successfully" });
});
