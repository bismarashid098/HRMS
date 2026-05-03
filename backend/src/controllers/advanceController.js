const asyncHandler = require("express-async-handler");
const Advance = require("../models/Advance");
const Employee = require("../models/Employee");
const Settings = require("../models/Settings");

// @desc    Request a salary advance
// @route   POST /api/advances
// @access  Private (Employee/HR)
exports.requestAdvance = asyncHandler(async (req, res) => {
  const { employeeId, amount, reason, date } = req.body;

  if (!amount || Number(amount) <= 0) {
    res.status(400);
    throw new Error("Amount must be greater than 0");
  }
  if (!reason) {
    res.status(400);
    throw new Error("Reason is required");
  }

  // Employees can only request for themselves
  let targetEmployeeId = employeeId;
  if (req.user && req.user.role === "Employee") {
    const selfEmp = await Employee.findOne({ user: req.user._id });
    if (!selfEmp) {
      res.status(404);
      throw new Error("Employee profile not found");
    }
    targetEmployeeId = selfEmp._id;
  }

  if (!targetEmployeeId) {
    res.status(400);
    throw new Error("Employee is required");
  }

  const employee = await Employee.findById(targetEmployeeId);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const advanceDate = date ? new Date(date) : new Date();
  if (Number.isNaN(advanceDate.getTime())) {
    res.status(400);
    throw new Error("Invalid date");
  }
  const month = advanceDate.getMonth() + 1;
  const year = advanceDate.getFullYear();

  // Admin-added advances are auto-approved; employee requests stay Pending
  const isAdmin = req.user && req.user.role === "Admin";

  // Enforce advance limit from system settings
  const settings = await Settings.findOne();
  const limitType = settings?.advances?.limitType || "PERCENTAGE";
  const limitValue = Number(settings?.advances?.limitValue ?? 30);

  const rawSalary = employee.salary;
  const basicSalary =
    typeof rawSalary === "number"
      ? rawSalary
      : rawSalary && typeof rawSalary.basic === "number"
      ? rawSalary.basic
      : 0;

  const maxAllowed =
    limitType === "FIXED" ? Math.max(0, limitValue) : Math.max(0, (basicSalary * limitValue) / 100);

  // Total requested this month (excluding rejected)
  const existing = await Advance.find({
    employee: targetEmployeeId,
    month,
    year,
    status: { $in: ["Pending", "Approved", "Paid"] }
  }).select("amount");
  const already = existing.reduce((s, a) => s + (a.amount || 0), 0);
  const requestedNow = Number(amount);

  if (maxAllowed > 0 && already + requestedNow > maxAllowed) {
    res.status(400);
    throw new Error(`Advance limit exceeded. Max allowed is ${maxAllowed}`);
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

  res.status(201).json(advance);
});

// @desc    Get all advances (with filters)
// @route   GET /api/advances
// @access  Private
exports.getAdvances = asyncHandler(async (req, res) => {
  const { month, year, employeeId, fromDate, toDate } = req.query;
  const query = {};

  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate)   { const e = new Date(toDate); e.setHours(23,59,59,999); query.date.$lte = e; }
  } else {
    if (month) query.month = Number(month);
    if (year)  query.year  = Number(year);
  }
  if (employeeId) query.employee = employeeId;

  if (req.user.role === "Employee") {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      res.status(404);
      throw new Error("Employee profile not found");
    }
    query.employee = employee._id;
  }

  const advances = await Advance.find(query)
    .populate({
      path: "employee",
      select: "name department",
      populate: { path: "user", select: "name" }
    })
    .sort({ date: -1 });

  res.json(advances);
});

// @desc    Get advances grouped by employee (ledger view)
// @route   GET /api/advances/ledger
// @access  Private (Admin)
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
      map.set(empId, {
        employee: adv.employee,
        advances: [],
        totalAmount: 0,
        approvedAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      });
    }
    const entry = map.get(empId);
    entry.advances.push(adv);
    entry.totalAmount += adv.amount || 0;
    if (adv.status === "Paid")          entry.paidAmount     += adv.amount || 0;
    else if (adv.status === "Approved") entry.approvedAmount += adv.amount || 0;
    else if (adv.status === "Pending")  entry.pendingAmount  += adv.amount || 0;
  });

  res.json(Array.from(map.values()));
});

// @desc    Update advance status (Approve/Reject)
// @route   PUT /api/advances/:id
// @access  Private (HR/Admin)
exports.updateAdvanceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const advance = await Advance.findById(req.params.id);

  if (!advance) {
    res.status(404);
    throw new Error("Advance request not found");
  }

  advance.status = status;
  await advance.save();

  res.json(advance);
});
