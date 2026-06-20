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
  const m    = Number(month);
  const y    = Number(year);
  const mOff = Number(monthlyOffDays) || 3;

  const monthStart  = new Date(y, m - 1, 1);
  const monthEnd    = new Date(y, m, 0, 23, 59, 59, 999); // last moment of last day
  const daysInMonth = new Date(y, m, 0).getDate();

  // Working days = total days − company off days
  const workingDays = Math.max(1, daysInMonth - mOff);
  const perDay      = basicSalary / workingDays;

  /* ── 1. UNPAID LEAVE DEDUCTION (cross-month aware) ── */
  const unpaidLeaves = await Leave.find({
    employee: employeeId,
    paid:     false,
    status:   "Approved",
    fromDate: { $lte: monthEnd },
    toDate:   { $gte: monthStart }
  });

  const unpaidDays = unpaidLeaves.reduce((s, l) => {
    // Clamp leave range to this month
    const start = l.fromDate < monthStart ? monthStart : l.fromDate;
    const end   = l.toDate   > monthEnd   ? monthEnd   : l.toDate;
    const days  = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return s + Math.max(0, days);
  }, 0);
  const leaveDeduction = unpaidDays * perDay;

  /* ── 2. PRESENT DAYS — Half Day counts as 0.5 ── */
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date:     { $gte: monthStart, $lte: monthEnd },
    status:   { $in: ["Present", "Late", "Half Day"] }
  });

  const presentDays = attendanceRecords.reduce((s, a) => {
    return s + (a.status === "Half Day" ? 0.5 : 1);
  }, 0);

  /* ── 3. ALL APPROVED LEAVE DAYS THIS MONTH (cross-month aware) ── */
  const allApprovedLeaves = await Leave.find({
    employee: employeeId,
    status:   "Approved",
    fromDate: { $lte: monthEnd },
    toDate:   { $gte: monthStart }
  });

  const approvedLeaveDays = allApprovedLeaves.reduce((s, l) => {
    const start = l.fromDate < monthStart ? monthStart : l.fromDate;
    const end   = l.toDate   > monthEnd   ? monthEnd   : l.toDate;
    const days  = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return s + Math.max(0, days);
  }, 0);

  /* ── 4. EXTRA ABSENT DEDUCTION ── */
  // Days unaccounted for = working days − effective present − approved leaves
  const extraOffDays      = Math.max(0, workingDays - presentDays - approvedLeaveDays);
  const extraOffDeduction = extraOffDays * perDay;

  /* ── 5. ADVANCE DEDUCTION ── */
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
