const asyncHandler = require("express-async-handler");
const Leave = require("../models/Leave");
const LeaveBalance = require("../models/LeaveBalance");
const Employee = require("../models/Employee");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeDate = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const calculateDays = (from, to) => {
  const f = normalizeDate(from);
  const t = normalizeDate(to);
  const diff = t - f;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Apply Leave
 * POST /api/leaves
 */
exports.applyLeave = asyncHandler(async (req, res) => {
  const { employeeId, type, fromDate, toDate, reason } = req.body;

  const validTypes = ["Casual", "Sick", "Annual", "Maternity", "Paternity", "Unpaid"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: `Invalid leave type. Must be one of: ${validTypes.join(", ")}` });
  }

  if (!fromDate || !toDate) {
    return res.status(400).json({ message: "fromDate and toDate are required" });
  }

  const from = normalizeDate(fromDate);
  const to = normalizeDate(toDate);
  if (from > to) {
    return res.status(400).json({ message: "fromDate must not be after toDate" });
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  // Check for overlapping leave
  const overlap = await Leave.findOne({
    employee: employeeId,
    status: { $in: ["Pending", "Approved"] },
    fromDate: { $lte: to },
    toDate: { $gte: from }
  });
  if (overlap) {
    return res.status(400).json({ message: "Employee already has a leave request overlapping this period" });
  }

  const days = calculateDays(from, to);

  let balance = await LeaveBalance.findOne({ employee: employeeId });
  if (!balance) {
    balance = await LeaveBalance.create({ employee: employeeId });
  }

  const key = type.toLowerCase();
  // Unpaid leave and types beyond casual/sick/annual are always unpaid
  const isPaidType = ["casual", "sick", "annual"].includes(key);
  let paid = isPaidType && (balance[key] || 0) >= days;

  const leave = await Leave.create({
    employee: employeeId,
    type,
    fromDate: from,
    toDate: to,
    totalDays: days,
    paid,
    reason
  });

  logAudit(req, {
    module: "Leave",
    action: "Create",
    recordId: leave._id,
    recordName: employee.name,
    description: `Leave applied for ${employee.name} — ${type} (${days} day${days > 1 ? "s" : ""}) from ${from.toISOString().slice(0,10)} to ${to.toISOString().slice(0,10)}`,
    newValues: { type, fromDate: from, toDate: to, totalDays: days, paid, reason }
  });

  res.status(201).json(leave);
});

/**
 * Approve / Reject Leave
 * PUT /api/leaves/:id
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
    return res.status(400).json({ message: "Leave already processed. Use admin edit to modify." });
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
    newValues: { status }
  });

  res.json({ message: `Leave ${status}` });
});

/**
 * Get My Leaves
 * GET /api/leaves/my/:employeeId
 */
exports.getMyLeaves = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  // For Managers: they can only see employees they manage (for now allow any — consistent with attendance policy)
  // For Admins: unrestricted
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Leave.countDocuments({ employee: employeeId });
  const leaves = await Leave.find({ employee: employeeId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ leaves, total, page: parseInt(page), limit: parseInt(limit) });
});

/**
 * Get All Leaves
 * GET /api/leaves
 */
exports.getAllLeaves = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type, employeeId, search } = req.query;
  const query = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (employeeId) query.employee = employeeId;

  if (search) {
    const escaped = escapeRegex(search);
    const empIds = await Employee.find({
      $or: [{ name: new RegExp(escaped, "i") }, { employeeId: new RegExp(escaped, "i") }]
    }).distinct("_id");
    query.employee = { $in: empIds };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Leave.countDocuments(query);

  const leaves = await Leave.find(query)
    .populate({
      path: "employee",
      select: "name department employeeId",
      populate: { path: "user", select: "name" }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ leaves, total, page: parseInt(page), limit: parseInt(limit) });
});

/**
 * Admin Full Edit Leave
 * PATCH /api/leaves/:id
 */
exports.adminEditLeave = asyncHandler(async (req, res) => {
  const { type, fromDate, toDate, reason, status } = req.body;

  const validTypes = ["Casual", "Sick", "Annual", "Maternity", "Paternity", "Unpaid"];
  if (type && !validTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid leave type" });
  }

  const validStatuses = ["Pending", "Approved", "Rejected"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: "Leave not found" });

  const from = fromDate ? normalizeDate(fromDate) : new Date(leave.fromDate);
  const to = toDate ? normalizeDate(toDate) : new Date(leave.toDate);
  if (from > to) {
    return res.status(400).json({ message: "fromDate must not be after toDate" });
  }

  const oldValues = {
    type: leave.type,
    fromDate: leave.fromDate,
    toDate: leave.toDate,
    reason: leave.reason,
    status: leave.status
  };

  // Handle balance restoration/deduction when status changes
  if (status && status !== leave.status) {
    const balance = await LeaveBalance.findOne({ employee: leave.employee });
    if (balance) {
      const key = leave.type.toLowerCase();
      // Approved → Rejected: restore balance
      if (leave.status === "Approved" && status === "Rejected" && leave.paid) {
        balance[key] = (balance[key] || 0) + leave.totalDays;
        await balance.save();
        leave.paid = false;
      }
      // Rejected/Pending → Approved: deduct balance
      if (leave.status !== "Approved" && status === "Approved") {
        const isPaidType = ["casual", "sick", "annual"].includes(key);
        if (isPaidType && (balance[key] || 0) >= leave.totalDays) {
          balance[key] = (balance[key] || 0) - leave.totalDays;
          await balance.save();
          leave.paid = true;
        } else {
          leave.paid = false;
        }
      }
    }
  }

  if (type) leave.type = type;
  if (fromDate) leave.fromDate = from;
  if (toDate) leave.toDate = to;
  if (reason !== undefined) leave.reason = reason;
  if (status) leave.status = status;
  leave.totalDays = calculateDays(leave.fromDate, leave.toDate);

  await leave.save();

  logAudit(req, {
    module: "Leave",
    action: "Edit",
    recordId: leave._id,
    recordName: String(leave.employee),
    description: `${req.user?.name} edited leave record`,
    oldValues,
    newValues: { type: leave.type, fromDate: leave.fromDate, toDate: leave.toDate, reason: leave.reason, status: leave.status }
  });

  res.json(leave);
});

/**
 * Cancel Leave (employee/admin can cancel pending or approved)
 * PUT /api/leaves/:id/cancel
 */
exports.cancelLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: "Leave not found" });

  if (!["Pending", "Approved"].includes(leave.status)) {
    return res.status(400).json({ message: "Cannot cancel this leave" });
  }

  // Restore balance if approved and paid
  if (leave.status === "Approved" && leave.paid) {
    const balance = await LeaveBalance.findOne({ employee: leave.employee });
    if (balance) {
      const key = leave.type.toLowerCase();
      balance[key] = (balance[key] || 0) + leave.totalDays;
      await balance.save();
    }
  }

  leave.status = "Rejected";
  await leave.save();

  logAudit(req, {
    module: "Leave",
    action: "Cancel",
    recordId: leave._id,
    recordName: String(leave.employee),
    description: `${req.user?.name} cancelled leave request (${leave.type}, ${leave.totalDays} day${leave.totalDays > 1 ? "s" : ""})`
  });

  res.json({ message: "Leave cancelled successfully" });
});

/**
 * Get Leave Balance
 * GET /api/leaves/balance/:employeeId
 */
exports.getLeaveBalance = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  let balance = await LeaveBalance.findOne({ employee: employeeId });
  if (!balance) balance = await LeaveBalance.create({ employee: employeeId });
  res.json(balance);
});

/**
 * Delete Leave
 * DELETE /api/leaves/:id
 */
exports.deleteLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: "Leave not found" });

  // Restore balance if it was approved and paid
  if (leave.status === "Approved" && leave.paid) {
    const balance = await LeaveBalance.findOne({ employee: leave.employee });
    if (balance) {
      const key = leave.type.toLowerCase();
      balance[key] = (balance[key] || 0) + leave.totalDays;
      await balance.save();
    }
  }

  const oldValues = { type: leave.type, fromDate: leave.fromDate, toDate: leave.toDate, status: leave.status };

  await Leave.findByIdAndDelete(req.params.id);

  logAudit(req, {
    module: "Leave",
    action: "Delete",
    recordId: leave._id,
    recordName: String(leave.employee),
    description: `${req.user?.name} deleted leave record (${leave.type}, ${leave.totalDays} day${leave.totalDays > 1 ? "s" : ""})`,
    oldValues,
    newValues: null
  });

  res.json({ message: "Leave deleted" });
});
