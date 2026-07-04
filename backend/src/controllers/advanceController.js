const asyncHandler = require("express-async-handler");
const Advance = require("../models/Advance");
const Employee = require("../models/Employee");
const Settings = require("../models/Settings");
const { logAudit } = require("../services/auditService");

exports.requestAdvance = asyncHandler(async (req, res) => {
  const { employeeId, amount, reason, date } = req.body;

  if (!amount || Number(amount) <= 0) { res.status(400); throw new Error("Amount must be greater than 0"); }
  if (!reason) { res.status(400); throw new Error("Reason is required"); }

  let targetEmployeeId = employeeId;
  if (req.user && req.user.role === "Employee") {
    const selfEmp = await Employee.findOne({ user: req.user._id });
    if (!selfEmp) { res.status(404); throw new Error("Employee profile not found"); }
    targetEmployeeId = selfEmp._id;
  }

  if (!targetEmployeeId) { res.status(400); throw new Error("Employee is required"); }

  const employee = await Employee.findById(targetEmployeeId);
  if (!employee) { res.status(404); throw new Error("Employee not found"); }

  const advanceDate = date ? new Date(date) : new Date();
  if (Number.isNaN(advanceDate.getTime())) { res.status(400); throw new Error("Invalid date"); }

  const month = advanceDate.getMonth() + 1;
  const year = advanceDate.getFullYear();

  const isAdmin = req.user && req.user.role === "Admin";

  const settings = await Settings.findOne();
  const limitType = settings?.advances?.limitType || "PERCENTAGE";
  const limitValue = Number(settings?.advances?.limitValue ?? 30);

  const rawSalary = employee.salary;
  const basicSalary = typeof rawSalary === "number" ? rawSalary : rawSalary?.basic ?? 0;

  // limitValue = 0 means advances are disabled
  if (limitValue === 0) {
    res.status(400);
    throw new Error("Advance salary is disabled in system settings");
  }

  const maxAllowed = limitType === "FIXED" ? limitValue : Math.max(0, (basicSalary * limitValue) / 100);

  const existing = await Advance.find({
    employee: targetEmployeeId,
    month,
    year,
    status: { $in: ["Pending", "Approved", "Paid"] }
  }).select("amount");
  const already = existing.reduce((s, a) => s + (a.amount || 0), 0);
  const requestedNow = Number(amount);

  if (already + requestedNow > maxAllowed) {
    res.status(400);
    throw new Error(`Advance limit exceeded. Max allowed: PKR ${maxAllowed.toLocaleString()}. Already requested: PKR ${already.toLocaleString()}`);
  }

  const advance = await Advance.create({
    employee: targetEmployeeId,
    amount: requestedNow,
    reason,
    date: advanceDate,
    month,
    year,
    status: isAdmin ? "Approved" : "Pending"
  });

  logAudit(req, {
    module: "Advance",
    action: "Create",
    recordId: advance._id,
    recordName: employee.name,
    description: `Advance of PKR ${requestedNow.toLocaleString()} requested for ${employee.name} — ${isAdmin ? "auto-approved" : "pending approval"}`,
    newValues: { amount: requestedNow, reason, month, year, status: advance.status }
  });

  res.status(201).json(advance);
});

exports.getAdvances = asyncHandler(async (req, res) => {
  const { month, year, employeeId, fromDate, toDate } = req.query;
  const query = {};

  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate) { const e = new Date(toDate); e.setHours(23, 59, 59, 999); query.date.$lte = e; }
  } else {
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
  }
  if (employeeId) query.employee = employeeId;

  const advances = await Advance.find(query)
    .populate({ path: "employee", select: "name department", populate: { path: "user", select: "name" } })
    .sort({ date: -1 });

  res.json(advances);
});

exports.getEmployeeLedger = asyncHandler(async (req, res) => {
  const { year, employeeId } = req.query;
  const query = {};
  if (year) query.year = Number(year);
  if (employeeId) query.employee = employeeId;

  const advances = await Advance.find(query)
    .populate({ path: "employee", select: "name department employeeId designation" })
    .sort({ date: -1 });

  const map = new Map();
  advances.forEach((adv) => {
    const empId = adv.employee?._id?.toString();
    if (!empId) return;
    if (!map.has(empId)) {
      map.set(empId, { employee: adv.employee, advances: [], totalAmount: 0, approvedAmount: 0, paidAmount: 0, pendingAmount: 0 });
    }
    const entry = map.get(empId);
    entry.advances.push(adv);
    entry.totalAmount += adv.amount || 0;
    if (adv.status === "Paid") entry.paidAmount += adv.amount || 0;
    else if (adv.status === "Approved") entry.approvedAmount += adv.amount || 0;
    else if (adv.status === "Pending") entry.pendingAmount += adv.amount || 0;
  });

  res.json(Array.from(map.values()));
});

exports.updateAdvanceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ["Approved", "Rejected", "Paid"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const advance = await Advance.findById(req.params.id);
  if (!advance) { res.status(404); throw new Error("Advance request not found"); }

  const oldStatus = advance.status;
  advance.status = status;
  await advance.save();

  logAudit(req, {
    module: "Advance",
    action: status === "Approved" ? "Approve" : "Reject",
    recordId: advance._id,
    recordName: String(advance.employee),
    description: `${req.user?.name} ${status.toLowerCase()} advance of PKR ${advance.amount?.toLocaleString()}`,
    oldValues: { status: oldStatus },
    newValues: { status }
  });

  res.json(advance);
});

exports.deleteAdvance = asyncHandler(async (req, res) => {
  const advance = await Advance.findById(req.params.id);
  if (!advance) { res.status(404); throw new Error("Advance not found"); }
  if (advance.status === "Paid") {
    return res.status(400).json({ message: "Cannot delete a paid advance (already deducted from payroll)" });
  }

  logAudit(req, {
    module: "Advance",
    action: "Delete",
    recordId: advance._id,
    recordName: String(advance.employee),
    description: `${req.user?.name} deleted advance of PKR ${advance.amount}`
  });

  await Advance.findByIdAndDelete(req.params.id);
  res.json({ message: "Advance deleted successfully" });
});
