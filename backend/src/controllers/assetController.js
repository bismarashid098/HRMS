const asyncHandler = require("express-async-handler");
const Asset = require("../models/Asset");
const Employee = require("../models/Employee");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getAssets = asyncHandler(async (req, res) => {
  const { status, category, branch, assignedTo, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (branch) query.branch = branch;
  if (assignedTo) query.assignedTo = assignedTo;
  if (search) {
    const re = new RegExp(escapeRegex(search), "i");
    query.$or = [{ name: re }, { assetCode: re }, { serialNumber: re }];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [assets, total] = await Promise.all([
    Asset.find(query)
      .populate("branch", "name")
      .populate("assignedTo", "name employeeId")
      .sort({ createdAt: -1 })
      .skip(skip).limit(parseInt(limit)),
    Asset.countDocuments(query)
  ]);
  res.json({ assets, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate("branch", "name")
    .populate("assignedTo", "name employeeId designation")
    .populate("assignmentHistory.employee", "name employeeId");
  if (!asset) { res.status(404); throw new Error("Asset not found"); }
  res.json(asset);
});

exports.createAsset = asyncHandler(async (req, res) => {
  const { name, assetCode, category, brand, model, serialNumber, purchaseDate, purchasePrice, currentValue, branch, notes } = req.body;
  if (!name) { res.status(400); throw new Error("Asset name is required"); }

  if (assetCode) {
    const existing = await Asset.findOne({ assetCode });
    if (existing) { res.status(409); throw new Error("Asset with this code already exists"); }
  }

  const asset = await Asset.create({
    name: name.trim(), assetCode, category, brand, model, serialNumber,
    purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
    purchasePrice: purchasePrice !== undefined ? Number(purchasePrice) : undefined,
    currentValue: currentValue !== undefined ? Number(currentValue) : undefined,
    branch, notes, createdBy: req.user._id
  });

  logAudit(req, { module: "Asset", action: "Create", recordId: asset._id, recordName: asset.name, description: `${req.user?.name} added asset: ${asset.name}`, newValues: asset.toObject() });

  res.status(201).json(asset);
});

exports.updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) { res.status(404); throw new Error("Asset not found"); }

  const old = asset.toObject();
  const fields = ["name", "category", "brand", "model", "serialNumber", "currentValue", "branch", "notes"];
  fields.forEach((f) => { if (req.body[f] !== undefined) asset[f] = req.body[f]; });
  if (req.body.purchaseDate) asset.purchaseDate = new Date(req.body.purchaseDate);
  if (req.body.purchasePrice !== undefined) asset.purchasePrice = Number(req.body.purchasePrice);

  await asset.save();
  logAudit(req, { module: "Asset", action: "Update", recordId: asset._id, recordName: asset.name, description: `${req.user?.name} updated asset: ${asset.name}`, oldValues: old, newValues: asset.toObject() });

  res.json(asset);
});

exports.assignAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) { res.status(404); throw new Error("Asset not found"); }
  if (asset.status === "Assigned") { res.status(400); throw new Error("Asset is already assigned. Return it first."); }
  if (asset.status === "Under Maintenance" || asset.status === "Disposed") {
    res.status(400); throw new Error(`Asset is ${asset.status}`);
  }

  const { employeeId, condition, notes } = req.body;
  if (!employeeId) { res.status(400); throw new Error("Employee ID is required"); }

  const emp = await Employee.findById(employeeId);
  if (!emp) { res.status(404); throw new Error("Employee not found"); }

  asset.assignmentHistory.push({ employee: employeeId, assignedAt: new Date(), condition: condition || "Good", notes });
  asset.assignedTo = employeeId;
  asset.status = "Assigned";
  await asset.save();

  logAudit(req, { module: "Asset", action: "Assign", recordId: asset._id, recordName: asset.name, description: `${req.user?.name} assigned ${asset.name} to ${emp.name}` });

  res.json(asset);
});

exports.returnAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) { res.status(404); throw new Error("Asset not found"); }
  if (asset.status !== "Assigned") { res.status(400); throw new Error("Asset is not currently assigned"); }

  const { condition, notes } = req.body;
  const lastEntry = asset.assignmentHistory[asset.assignmentHistory.length - 1];
  if (lastEntry && !lastEntry.returnedAt) {
    lastEntry.returnedAt = new Date();
    if (condition) lastEntry.condition = condition;
    if (notes) lastEntry.notes = notes;
  }

  asset.assignedTo = null;
  asset.status = condition === "Damaged" ? "Under Maintenance" : "Available";
  await asset.save();

  logAudit(req, { module: "Asset", action: "Return", recordId: asset._id, recordName: asset.name, description: `${req.user?.name} returned asset: ${asset.name}` });

  res.json(asset);
});

exports.deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) { res.status(404); throw new Error("Asset not found"); }
  if (asset.status === "Assigned") { res.status(400); throw new Error("Cannot delete an assigned asset. Return it first."); }

  logAudit(req, { module: "Asset", action: "Delete", recordId: asset._id, recordName: asset.name, description: `${req.user?.name} deleted asset: ${asset.name}` });

  await Asset.findByIdAndDelete(req.params.id);
  res.json({ message: "Asset deleted successfully" });
});
