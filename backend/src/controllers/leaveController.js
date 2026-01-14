const Leave = require("../models/Leave");
const LeaveBalance = require("../models/LeaveBalance");
const Employee = require("../models/Employee");

// helper
const calculateDays = (from, to) => {
  const diff = new Date(to) - new Date(from);
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Apply Leave
 * POST /api/leaves
 * Employee
 */
exports.applyLeave = async (req, res) => {
  const { employeeId, type, fromDate, toDate, reason } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const days = calculateDays(fromDate, toDate);

  let balance = await LeaveBalance.findOne({ employee: employeeId });
  if (!balance) {
    balance = await LeaveBalance.create({ employee: employeeId });
  }

  const key = type.toLowerCase();
  let paid = true;

  if (balance[key] < days) {
    paid = false;
  }

  const leave = await Leave.create({
    employee: employeeId,
    type,
    fromDate,
    toDate,
    totalDays: days,
    paid,
    reason
  });

  res.status(201).json(leave);
};

/**
 * Approve / Reject Leave
 * PUT /api/leaves/:id
 * Admin, HR
 */
exports.updateLeaveStatus = async (req, res) => {
  const { status } = req.body;

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return res.status(404).json({ message: "Leave not found" });
  }

  if (leave.status !== "Pending") {
    return res.status(400).json({ message: "Leave already processed" });
  }

  if (status === "Approved" && leave.paid) {
    const balance = await LeaveBalance.findOne({ employee: leave.employee });
    const key = leave.type.toLowerCase();
    balance[key] -= leave.totalDays;
    await balance.save();
  }

  leave.status = status;
  await leave.save();

  res.json({ message: `Leave ${status}` });
};

/**
 * Get My Leaves
 * GET /api/leaves/my/:employeeId
 */
exports.getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ employee: req.params.employeeId })
    .sort({ createdAt: -1 });

  res.json(leaves);
};

/**
 * Get All Leaves
 * GET /api/leaves
 * Admin, HR
 */
exports.getAllLeaves = async (req, res) => {
  const leaves = await Leave.find()
    .populate("employee", "employeeId department");

  res.json(leaves);
};
