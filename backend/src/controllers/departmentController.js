const asyncHandler = require("express-async-handler");
const Department = require("../models/Department");
const Employee = require("../models/Employee");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getDepartments = asyncHandler(async (req, res) => {
  const { search, isActive, page = 1, limit = 50 } = req.query;
  const query = {};
  if (isActive !== undefined) query.isActive = isActive === "true";
  if (search) query.name = new RegExp(escapeRegex(search), "i");

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [departments, total] = await Promise.all([
    Department.find(query).populate("head", "name employeeId").sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
    Department.countDocuments(query)
  ]);
  res.json({ departments, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getDepartmentById = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id).populate("head", "name employeeId designation");
  if (!dept) { res.status(404); throw new Error("Department not found"); }
  res.json(dept);
});

exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, head } = req.body;
  if (!name) { res.status(400); throw new Error("Department name is required"); }

  const existing = await Department.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i") });
  if (existing) { res.status(409); throw new Error("Department with this name already exists"); }

  const dept = await Department.create({ name: name.trim(), code, description, head: head || undefined });

  logAudit(req, { module: "Department", action: "Create", recordId: dept._id, recordName: dept.name, description: `${req.user?.name} created department ${dept.name}`, newValues: dept.toObject() });

  res.status(201).json(dept);
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id);
  if (!dept) { res.status(404); throw new Error("Department not found"); }

  const { name, code, description, head, isActive } = req.body;
  const old = dept.toObject();

  if (name !== undefined) {
    const clash = await Department.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i"), _id: { $ne: dept._id } });
    if (clash) { res.status(409); throw new Error("Another department with this name already exists"); }
    dept.name = name.trim();
  }
  if (code !== undefined) dept.code = code;
  if (description !== undefined) dept.description = description;
  if (head !== undefined) dept.head = head || null;
  if (isActive !== undefined) dept.isActive = Boolean(isActive);

  await dept.save();

  logAudit(req, { module: "Department", action: "Update", recordId: dept._id, recordName: dept.name, description: `${req.user?.name} updated department ${dept.name}`, oldValues: old, newValues: dept.toObject() });

  res.json(dept);
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id);
  if (!dept) { res.status(404); throw new Error("Department not found"); }

  const empCount = await Employee.countDocuments({ department: dept.name, isDeleted: { $ne: true } });
  if (empCount > 0) { res.status(400); throw new Error(`Cannot delete: ${empCount} active employee(s) belong to this department`); }

  logAudit(req, { module: "Department", action: "Delete", recordId: dept._id, recordName: dept.name, description: `${req.user?.name} deleted department ${dept.name}` });

  await Department.findByIdAndDelete(req.params.id);
  res.json({ message: "Department deleted successfully" });
});
