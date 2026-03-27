const Attendance = require("../models/Attendance");
const Leave      = require("../models/Leave");
const Advance    = require("../models/Advance");

/**
 * calculateDeductions
 * @param {ObjectId} employeeId
 * @param {Number}   month        1-12
 * @param {Number}   year
 * @param {Number}   basicSalary
 * @param {Number}   monthlyOffDays  company-given off days per month (default 3)
 */
exports.calculateDeductions = async (
  employeeId,
  month,
  year,
  basicSalary,
  monthlyOffDays = 3
) => {
  const m      = Number(month);
  const y      = Number(year);
  const mOff   = Number(monthlyOffDays) || 3;

  const monthStart = new Date(y, m - 1, 1);
  const monthEnd   = new Date(y, m, 0);               // last day of month
  const daysInMonth = monthEnd.getDate();

  // Working days = total days − company off days
  const workingDays = Math.max(1, daysInMonth - mOff);
  const perDay      = basicSalary / workingDays;

  /* ── 1. UNPAID LEAVE DEDUCTION ── */
  const unpaidLeaves = await Leave.find({
    employee: employeeId,
    paid: false,
    status: "Approved",
    fromDate: { $gte: monthStart, $lte: monthEnd }
  });
  const unpaidDays     = unpaidLeaves.reduce((s, l) => s + (l.totalDays || 0), 0);
  const leaveDeduction = unpaidDays * perDay;

  /* ── 2. EXTRA OFF DEDUCTION (attendance-based absent days) ── */
  // How many days did the employee actually punch in this month?
  const presentRecords = await Attendance.find({
    employee: employeeId,
    date:     { $gte: monthStart, $lte: monthEnd },
    status:   { $in: ["Present", "Late", "Half Day"] }
  });
  const presentDays = presentRecords.length;

  // All approved leave days (paid or unpaid) — they count as "accounted for"
  const allApprovedLeaves = await Leave.find({
    employee: employeeId,
    status:   "Approved",
    fromDate: { $gte: monthStart, $lte: monthEnd }
  });
  const approvedLeaveDays = allApprovedLeaves.reduce((s, l) => s + (l.totalDays || 0), 0);

  // Extra absent days = working days − present − all approved leaves
  const extraOffDays      = Math.max(0, workingDays - presentDays - approvedLeaveDays);
  const extraOffDeduction = extraOffDays * perDay;

  /* ── 3. ADVANCE DEDUCTION ── */
  const advances = await Advance.find({
    employee: employeeId,
    month:    m,
    year:     y,
    status:   "Approved"
  });
  const advanceDeduction = advances.reduce((s, a) => s + (a.amount || 0), 0);

  const totalDeductions = leaveDeduction + extraOffDeduction + advanceDeduction;

  return {
    total: totalDeductions,
    leaveDeduction,
    advanceDeduction,
    extraOffDeduction,
    extraOffDays,
    unpaidDays,
    presentDays,
    workingDays,
    advanceIds: advances.map(a => a._id)
  };
};
