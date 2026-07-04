const asyncHandler = require("express-async-handler");
const Shift = require("../models/Shift");
const { logAudit } = require("../services/auditService");

const TIME_RE = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getShifts = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const query = {};
  if (isActive !== undefined) query.isActive = isActive === "true";
  const shifts = await Shift.find(query).sort({ name: 1 });
  res.json(shifts);
});

exports.getShiftById = asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) { res.status(404); throw new Error("Shift not found"); }
  res.json(shift);
});

exports.createShift = asyncHandler(async (req, res) => {
  const { name, startTime, endTime, gracePeriod, workingDays, overtimeEnabled } = req.body;
  if (!name) { res.status(400); throw new Error("Shift name is required"); }
  if (!startTime || !TIME_RE.test(startTime)) { res.status(400); throw new Error("startTime must be HH:MM"); }
  if (!endTime || !TIME_RE.test(endTime)) { res.status(400); throw new Error("endTime must be HH:MM"); }

  const existing = await Shift.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i") });
  if (existing) { res.status(409); throw new Error("Shift with this name already exists"); }

  const shift = await Shift.create({
    name: name.trim(), startTime, endTime,
    gracePeriod: gracePeriod !== undefined ? Number(gracePeriod) : 10,
    workingDays,
    overtimeEnabled: Boolean(overtimeEnabled)
  });

  logAudit(req, { module: "Shift", action: "Create", recordId: shift._id, recordName: shift.name, description: `${req.user?.name} created shift ${shift.name}`, newValues: shift.toObject() });

  res.status(201).json(shift);
});

exports.updateShift = asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) { res.status(404); throw new Error("Shift not found"); }

  const { name, startTime, endTime, gracePeriod, workingDays, overtimeEnabled, isActive } = req.body;
  const old = shift.toObject();

  if (name !== undefined) {
    const clash = await Shift.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i"), _id: { $ne: shift._id } });
    if (clash) { res.status(409); throw new Error("Another shift with this name exists"); }
    shift.name = name.trim();
  }
  if (startTime !== undefined) {
    if (!TIME_RE.test(startTime)) { res.status(400); throw new Error("startTime must be HH:MM"); }
    shift.startTime = startTime;
  }
  if (endTime !== undefined) {
    if (!TIME_RE.test(endTime)) { res.status(400); throw new Error("endTime must be HH:MM"); }
    shift.endTime = endTime;
  }
  if (gracePeriod !== undefined) shift.gracePeriod = Math.max(0, Number(gracePeriod));
  if (workingDays !== undefined) shift.workingDays = workingDays;
  if (overtimeEnabled !== undefined) shift.overtimeEnabled = Boolean(overtimeEnabled);
  if (isActive !== undefined) shift.isActive = Boolean(isActive);

  await shift.save();
  logAudit(req, { module: "Shift", action: "Update", recordId: shift._id, recordName: shift.name, description: `${req.user?.name} updated shift ${shift.name}`, oldValues: old, newValues: shift.toObject() });

  res.json(shift);
});

exports.deleteShift = asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) { res.status(404); throw new Error("Shift not found"); }

  logAudit(req, { module: "Shift", action: "Delete", recordId: shift._id, recordName: shift.name, description: `${req.user?.name} deleted shift ${shift.name}` });

  await Shift.findByIdAndDelete(req.params.id);
  res.json({ message: "Shift deleted successfully" });
});
