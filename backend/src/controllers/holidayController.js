const asyncHandler = require("express-async-handler");
const Holiday = require("../models/Holiday");
const { logAudit } = require("../services/auditService");

exports.getHolidays = asyncHandler(async (req, res) => {
  const { year, type } = req.query;
  const query = {};
  if (year) query.year = Number(year);
  if (type) query.type = type;
  const holidays = await Holiday.find(query).sort({ date: 1 });
  res.json(holidays);
});

exports.getHolidayById = asyncHandler(async (req, res) => {
  const h = await Holiday.findById(req.params.id);
  if (!h) { res.status(404); throw new Error("Holiday not found"); }
  res.json(h);
});

exports.createHoliday = asyncHandler(async (req, res) => {
  const { name, date, endDate, type, description, isRecurring } = req.body;
  if (!name) { res.status(400); throw new Error("Holiday name is required"); }
  if (!date) { res.status(400); throw new Error("Date is required"); }

  const d = new Date(date);
  if (isNaN(d.getTime())) { res.status(400); throw new Error("Invalid date"); }

  const holiday = await Holiday.create({
    name: name.trim(),
    date: d,
    endDate: endDate ? new Date(endDate) : undefined,
    type,
    description,
    year: d.getFullYear(),
    isRecurring: Boolean(isRecurring)
  });

  logAudit(req, { module: "Holiday", action: "Create", recordId: holiday._id, recordName: holiday.name, description: `${req.user?.name} created holiday: ${holiday.name}`, newValues: holiday.toObject() });

  res.status(201).json(holiday);
});

exports.updateHoliday = asyncHandler(async (req, res) => {
  const h = await Holiday.findById(req.params.id);
  if (!h) { res.status(404); throw new Error("Holiday not found"); }

  const { name, date, endDate, type, description, isRecurring } = req.body;
  const old = h.toObject();

  if (name !== undefined) h.name = name.trim();
  if (date !== undefined) {
    const d = new Date(date);
    if (isNaN(d.getTime())) { res.status(400); throw new Error("Invalid date"); }
    h.date = d;
    h.year = d.getFullYear();
  }
  if (endDate !== undefined) h.endDate = endDate ? new Date(endDate) : null;
  if (type !== undefined) h.type = type;
  if (description !== undefined) h.description = description;
  if (isRecurring !== undefined) h.isRecurring = Boolean(isRecurring);

  await h.save();
  logAudit(req, { module: "Holiday", action: "Update", recordId: h._id, recordName: h.name, description: `${req.user?.name} updated holiday: ${h.name}`, oldValues: old, newValues: h.toObject() });

  res.json(h);
});

exports.deleteHoliday = asyncHandler(async (req, res) => {
  const h = await Holiday.findById(req.params.id);
  if (!h) { res.status(404); throw new Error("Holiday not found"); }

  logAudit(req, { module: "Holiday", action: "Delete", recordId: h._id, recordName: h.name, description: `${req.user?.name} deleted holiday: ${h.name}` });

  await Holiday.findByIdAndDelete(req.params.id);
  res.json({ message: "Holiday deleted successfully" });
});
