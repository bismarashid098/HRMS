const asyncHandler = require("express-async-handler");
const Leave = require("../models/Leave");
const LeaveBalance = require("../models/LeaveBalance");
const Employee = require("../models/Employee");
const { logAudit } = require("../services/auditService");

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
exports.applyLeave = asyncHandler(async (req, res) => {
  const { employeeId, type, fromDate, toDate, reason } = req.body;

  const validTypes = ["Casual", "Sick", "Annual"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: `Invalid leave type. Must be one of: ${validTypes.join(", ")}` });
  }

  if (!fromDate || !toDate) {
    return res.status(400).json({ message: "fromDate and toDate are required" });
  }
  if (new Date(fromDate) > new Date(toDate)) {
    return res.status(400).json({ message: "fromDate must not be after toDate" });
  }

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

  logAudit(req, {
    module: "Leave",
    action: "Create",
    recordId: leave._id,
    recordName: employee.name,
    description: `Leave applied for ${employee.name} — ${type} (${days} day${days > 1 ? "s" : ""}) from ${fromDate} to ${toDate}`,
    newValues: { type, fromDate, toDate, totalDays: days, paid, reason },
  });

  res.status(201).json(leave);
});

/**
 * Approve / Reject Leave
 * PUT /api/leaves/:id
 * Admin, HR
 */
exports.updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ["Approved", "Rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return res.status(404).json({ message: "Leave not found" });
  }

  if (leave.status !== "Pending") {
    return res.status(400).json({ message: "Leave already processed" });
  }

  if (status === "Approved" && leave.paid) {
    const balance = await LeaveBalance.findOne({ employee: leave.employee });
    if (balance) {
      const key = leave.type.toLowerCase();
      const currentBalance = balance[key] || 0;
      if (currentBalance < leave.totalDays) {
        leave.paid = false;
      } else {
        balance[key] = currentBalance - leave.totalDays;
        await balance.save();
      }
    }
  }

  const oldStatus = leave.status;
  leave.status = status;
  await leave.save();

  logAudit(req, {
    module: "Leave",
    action: status === "Approved" ? "Approve" : "Reject",
    recordId: leave._id,
    recordName: String(leave.employee),
    description: `${req.user?.name} ${status.toLowerCase()} leave request (${leave.type}, ${leave.totalDays} day${leave.totalDays > 1 ? "s" : ""})`,
    oldValues: { status: oldStatus },
    newValues: { status },
  });

  res.json({ message: `Leave ${status}` });
});

/**
 * Get My Leaves
 * GET /api/leaves/my/:employeeId
 */
exports.getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ employee: req.params.employeeId })
    .sort({ createdAt: -1 });

  res.json(leaves);
});

/**
 * Get All Leaves
 * GET /api/leaves
 * Admin, HR
 */
exports.getAllLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find()
    .populate({
      path: "employee",
      select: "name department",
      populate: { path: "user", select: "name" }
    })
    .sort({ createdAt: -1 });

  res.json(leaves);
});
