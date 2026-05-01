const asyncHandler = require("express-async-handler");
const Advance = require("../models/Advance");
const Employee = require("../models/Employee");

// @desc    Request a salary advance
// @route   POST /api/advances
// @access  Private (Employee/HR)
exports.requestAdvance = asyncHandler(async (req, res) => {
  const { employeeId, amount, reason, date } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const advanceDate = date ? new Date(date) : new Date();
  const month = advanceDate.getMonth() + 1;
  const year = advanceDate.getFullYear();

  // Admin-added advances are auto-approved; employee requests stay Pending
  const isAdmin = req.user && req.user.role === "Admin";

  const advance = await Advance.create({
    employee: employeeId,
    amount,
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
