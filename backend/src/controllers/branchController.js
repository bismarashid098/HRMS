const asyncHandler = require("express-async-handler");
const Branch = require("../models/Branch");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getBranches = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;
  const query = {};
  if (isActive !== undefined) query.isActive = isActive === "true";
  if (search) query.$or = [
    { name: new RegExp(escapeRegex(search), "i") },
    { city: new RegExp(escapeRegex(search), "i") }
  ];
  const branches = await Branch.find(query).populate("manager", "name employeeId").sort({ name: 1 });
  res.json(branches);
});

exports.getBranchById = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id).populate("manager", "name employeeId designation");
  if (!branch) { res.status(404); throw new Error("Branch not found"); }
  res.json(branch);
});

exports.createBranch = asyncHandler(async (req, res) => {
  const { name, code, address, city, country, phone, email, manager } = req.body;
  if (!name) { res.status(400); throw new Error("Branch name is required"); }

  const existing = await Branch.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i") });
  if (existing) { res.status(409); throw new Error("Branch with this name already exists"); }

  const branch = await Branch.create({ name: name.trim(), code, address, city, country, phone, email, manager: manager || undefined });

  logAudit(req, { module: "Branch", action: "Create", recordId: branch._id, recordName: branch.name, description: `${req.user?.name} created branch ${branch.name}`, newValues: branch.toObject() });

  res.status(201).json(branch);
});

exports.updateBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) { res.status(404); throw new Error("Branch not found"); }

  const { name, code, address, city, country, phone, email, manager, isActive } = req.body;
  const old = branch.toObject();

  if (name !== undefined) {
    const clash = await Branch.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i"), _id: { $ne: branch._id } });
    if (clash) { res.status(409); throw new Error("Another branch with this name exists"); }
    branch.name = name.trim();
  }
  if (code !== undefined) branch.code = code;
  if (address !== undefined) branch.address = address;
  if (city !== undefined) branch.city = city;
  if (country !== undefined) branch.country = country;
  if (phone !== undefined) branch.phone = phone;
  if (email !== undefined) branch.email = email;
  if (manager !== undefined) branch.manager = manager || null;
  if (isActive !== undefined) branch.isActive = Boolean(isActive);

  await branch.save();
  logAudit(req, { module: "Branch", action: "Update", recordId: branch._id, recordName: branch.name, description: `${req.user?.name} updated branch ${branch.name}`, oldValues: old, newValues: branch.toObject() });

  res.json(branch);
});

exports.deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) { res.status(404); throw new Error("Branch not found"); }

  logAudit(req, { module: "Branch", action: "Delete", recordId: branch._id, recordName: branch.name, description: `${req.user?.name} deleted branch ${branch.name}` });

  await Branch.findByIdAndDelete(req.params.id);
  res.json({ message: "Branch deleted successfully" });
});
