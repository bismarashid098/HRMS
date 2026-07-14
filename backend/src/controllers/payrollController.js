const asyncHandler = require("express-async-handler");
const Payroll = require("../models/payroll");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const { calculateDeductions } = require("../services/payrollService");
const Settings = require("../models/Settings");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getAllPayrolls = asyncHandler(async (req, res) => {
  const { month, year, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (month && String(month).includes("-")) {
    const [y, m] = month.split("-");
    query.year = parseInt(y);
    query.month = parseInt(m);
  } else {
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
  }

  if (search) {
    const escaped = escapeRegex(search);
    const employees = await Employee.find({
      $or: [{ name: new RegExp(escaped, "i") }, { employeeId: new RegExp(escaped, "i") }]
    }).distinct("_id");
    query.employee = { $in: employees };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Payroll.countDocuments(query);

  const payrolls = await Payroll.find(query)
    .populate({ path: "employee", select: "name employeeId department designation" })
    .sort({ year: -1, month: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const records = payrolls.map((p) => ({
    _id: p._id,
    employeeName: p.employee?.name || "—",
    employeeCode: p.employee?.employeeId || "",
    department: p.employee?.department || "",
    designation: p.employee?.designation || "",
    month: `${p.year}-${String(p.month).padStart(2, "0")}`,
    basicSalary: p.basicSalary,
    allowance: p.allowance || 0,
    deductions: p.deductions || 0,
    netPay: p.netSalary,
    status: p.status,
    workingDays: p.workingDays,
    presentDays: p.presentDays
  }));

  res.json({ records, total, page: parseInt(page), limit: parseInt(limit) });
});

/* ──────────────────────────────────────────────────────────────
   Generate Payroll
────────────────────────────────────────────────────────────── */
exports.generatePayroll = asyncHandler(async (req, res) => {
  const { employeeId, month, year } = req.body;

  // Validate month and year
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  if (!monthNum || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ message: "month must be between 1 and 12" });
  }
  if (!yearNum || yearNum < 2000 || yearNum > 2100) {
    return res.status(400).json({ message: "Invalid year" });
  }

  const existingPayroll = await Payroll.findOne({ employee: employeeId, month: monthNum, year: yearNum });
  if (existingPayroll) {
    return res.status(409).json({
      message: "Payroll already generated for this employee for this period",
      payroll: existingPayroll
    });
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const settings = await Settings.findOne();
  const taxPercentage = Number(settings?.payroll?.taxPercentage ?? 0);
  const defaultMonthlyOffDays = Number(settings?.payroll?.monthlyOffDays ?? 3);

  const rawSalary = employee.salary;
  const basic =
    typeof rawSalary === "number"
      ? rawSalary
      : rawSalary && typeof rawSalary.basic === "number"
      ? rawSalary.basic
      : 0;

  const allowance =
    rawSalary && typeof rawSalary === "object" && typeof rawSalary.allowance === "number"
      ? rawSalary.allowance
      : 0;

  // EOBI and Provident Fund deductions
  const eobiDeduction = employee.eobi ? (employee.eobiAmount || 0) : 0;
  const pfDeduction = employee.providentFund
    ? Math.round((basic * (employee.providentFundPercentage || 0)) / 100)
    : 0;

  const deductionResult = await calculateDeductions(
    employeeId,
    monthNum,
    yearNum,
    basic,
    employee.monthlyOffDays ?? defaultMonthlyOffDays
  );

  const taxDeduction = Math.max(0, (basic * Math.max(0, taxPercentage)) / 100);
  const totalDeductions = deductionResult.total + taxDeduction + eobiDeduction + pfDeduction;
  const netSalary = Math.max(0, basic + allowance - totalDeductions);

  try {
    const payroll = await Payroll.create({
      employee: employeeId,
      month: monthNum,
      year: yearNum,
      basicSalary: basic,
      allowance,
      deductions: totalDeductions,
      taxDeduction,
      advanceDeduction: deductionResult.advanceDeduction,
      leaveDeduction: deductionResult.leaveDeduction,
      extraOffDeduction: deductionResult.extraOffDeduction,
      extraOffDays: deductionResult.extraOffDays,
      eobiDeduction,
      pfDeduction,
      workingDays: deductionResult.workingDays,
      presentDays: deductionResult.presentDays,
      netSalary,
      status: "Generated"
    });

    if (deductionResult.advanceIds && deductionResult.advanceIds.length > 0) {
      await require("../models/Advance").updateMany(
        { _id: { $in: deductionResult.advanceIds } },
        { $set: { status: "Paid" } }
      );
    }

    logAudit(req, {
      module: "Payroll",
      action: "Generate",
      recordId: payroll._id,
      recordName: employee.name,
      description: `${req.user?.name} generated payroll for ${employee.name} — ${monthNum}/${yearNum} (Net: PKR ${netSalary.toLocaleString()})`,
      newValues: { basicSalary: basic, allowance, netSalary, month: monthNum, year: yearNum }
    });

    res.status(201).json(payroll);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Payroll already generated for this employee for this month" });
    }
    throw err;
  }
});

/* ──────────────────────────────────────────────────────────────
   Payroll Overview
────────────────────────────────────────────────────────────── */
exports.getPayrollOverview = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const targetMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

  const employees = await Employee.find({
    employmentStatus: "Active",
    isDeleted: { $ne: true }
  }).populate("user", "name email").lean();

  const settings = await Settings.findOne();
  const taxPercentage = Number(settings?.payroll?.taxPercentage ?? 0);
  const defaultMonthlyOffDays = Number(settings?.payroll?.monthlyOffDays ?? 3);

  // Fetch existing payrolls for this month in bulk (avoids N+1 on payroll lookup)
  const existingPayrolls = await Payroll.find({ month: targetMonth, year: targetYear }).lean();
  const payrollMap = {};
  existingPayrolls.forEach((p) => { payrollMap[p.employee.toString()] = p; });

  // Process employees in batches to avoid overwhelming the DB
  const batchSize = 20;
  const overview = [];

  for (let i = 0; i < employees.length; i += batchSize) {
    const batch = employees.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (emp) => {
        const rawSalary = emp.salary;
        const basic =
          typeof rawSalary === "number"
            ? rawSalary
            : rawSalary && typeof rawSalary.basic === "number"
            ? rawSalary.basic
            : 0;

        const allowance =
          rawSalary && typeof rawSalary === "object" && typeof rawSalary.allowance === "number"
            ? rawSalary.allowance
            : 0;

        const deductionResult = await calculateDeductions(
          emp._id,
          targetMonth,
          targetYear,
          basic,
          emp.monthlyOffDays ?? defaultMonthlyOffDays
        );

        const taxDeduction = Math.max(0, (basic * Math.max(0, taxPercentage)) / 100);
        const eobiDeduction = emp.eobi ? (emp.eobiAmount || 0) : 0;
        const pfDeduction = emp.providentFund ? Math.round((basic * (emp.providentFundPercentage || 0)) / 100) : 0;
        const netSalary = Math.max(0, basic + allowance - deductionResult.total - taxDeduction - eobiDeduction - pfDeduction);

        const payroll = payrollMap[emp._id.toString()];

        return {
          employeeId: emp._id,
          employeeCode: emp.employeeId,
          name: emp.name || (emp.user && emp.user.name) || "",
          department: emp.department,
          designation: emp.designation,
          basicSalary: basic,
          allowance,
          workingDays: deductionResult.workingDays,
          presentDays: deductionResult.presentDays,
          unpaidLeaveDays: deductionResult.unpaidDays || 0,
          leaveDeduction: deductionResult.leaveDeduction,
          advanceDeduction: deductionResult.advanceDeduction,
          extraOffDeduction: deductionResult.extraOffDeduction,
          extraOffDays: deductionResult.extraOffDays,
          taxDeduction,
          eobiDeduction,
          pfDeduction,
          totalDeductions: deductionResult.total + taxDeduction + eobiDeduction + pfDeduction,
          taxPercentage,
          netSalary,
          payrollStatus: payroll ? payroll.status : "Not Generated",
          payrollId: payroll ? payroll._id : null
        };
      })
    );
    overview.push(...batchResults);
  }

  res.json(overview);
});

/* ──────────────────────────────────────────────────────────────
   Payroll Breakdown
────────────────────────────────────────────────────────────── */
exports.getPayrollBreakdown = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate({
    path: "employee",
    select: "name employeeId department designation salary monthlyOffDays eobi eobiAmount providentFund providentFundPercentage",
    populate: { path: "user", select: "name" }
  });

  if (!payroll) return res.status(404).json({ message: "Payroll not found" });

  const settings = await Settings.findOne();

  // Use stored values for approved payroll; recalculate only for generated
  const advanceEntries = await require("../models/Advance").find({
    employee: payroll.employee._id,
    month: payroll.month,
    year: payroll.year,
    status: { $in: ["Approved", "Paid"] }
  }).select("amount date reason status").sort({ date: 1 });

  res.json({
    employeeName: payroll.employee.name || payroll.employee.user?.name || "",
    employeeCode: payroll.employee.employeeId,
    department: payroll.employee.department,
    designation: payroll.employee.designation,
    month: payroll.month,
    year: payroll.year,
    status: payroll.status,
    basicSalary: payroll.basicSalary,
    allowance: payroll.allowance || 0,
    grossSalary: (payroll.basicSalary || 0) + (payroll.allowance || 0),
    taxPercentage: settings?.payroll?.taxPercentage ?? 0,
    taxDeduction: payroll.taxDeduction || 0,
    workingDays: payroll.workingDays,
    presentDays: payroll.presentDays,
    leaveDeduction: payroll.leaveDeduction || 0,
    advanceDeduction: payroll.advanceDeduction || 0,
    advanceEntries,
    extraOffDeduction: payroll.extraOffDeduction || 0,
    extraOffDays: payroll.extraOffDays || 0,
    eobiDeduction: payroll.eobiDeduction || 0,
    pfDeduction: payroll.pfDeduction || 0,
    totalDeductions: payroll.deductions || 0,
    netSalary: payroll.netSalary
  });
});

/* ──────────────────────────────────────────────────────────────
   Approve Payroll
────────────────────────────────────────────────────────────── */
exports.approvePayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);
  if (!payroll) return res.status(404).json({ message: "Payroll not found" });
  if (payroll.status === "Approved") return res.status(400).json({ message: "Payroll is already approved" });

  payroll.status = "Approved";
  await payroll.save();

  // Lock attendance records for this month
  const monthStart = new Date(payroll.year, payroll.month - 1, 1);
  const monthEnd = new Date(payroll.year, payroll.month, 0, 23, 59, 59, 999);
  await Attendance.updateMany(
    { employee: payroll.employee, date: { $gte: monthStart, $lte: monthEnd } },
    { $set: { isLocked: true } }
  );

  logAudit(req, {
    module: "Payroll",
    action: "Approve",
    recordId: payroll._id,
    recordName: String(payroll.employee),
    description: `${req.user?.name} approved payroll for month ${payroll.month}/${payroll.year}`,
    oldValues: { status: "Generated" },
    newValues: { status: "Approved" }
  });

  res.json({ message: "Payroll approved and attendance locked" });
});

/* ──────────────────────────────────────────────────────────────
   Delete Payroll (Generated only)
────────────────────────────────────────────────────────────── */
exports.deletePayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);
  if (!payroll) return res.status(404).json({ message: "Payroll not found" });
  if (payroll.status === "Approved") return res.status(400).json({ message: "Cannot delete an approved payroll" });

  // Restore advance statuses
  await require("../models/Advance").updateMany(
    { employee: payroll.employee, month: payroll.month, year: payroll.year, status: "Paid" },
    { $set: { status: "Approved" } }
  );

  logAudit(req, {
    module: "Payroll",
    action: "Delete",
    recordId: payroll._id,
    recordName: String(payroll.employee),
    description: `${req.user?.name} deleted payroll ${payroll.month}/${payroll.year}`
  });

  await Payroll.findByIdAndDelete(req.params.id);
  res.json({ message: "Payroll deleted successfully" });
});

exports.getPayrollById = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate("employee", "name employeeId department designation");
  if (!payroll) return res.status(404).json({ message: "Payroll not found" });
  res.json(payroll);
});

exports.getPayrollHistory = asyncHandler(async (req, res) => {
  const records = await Payroll.find({ employee: req.params.employeeId }).sort({ year: -1, month: -1 });
  res.json(records);
});
