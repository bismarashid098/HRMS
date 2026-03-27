const asyncHandler = require("express-async-handler");
const Payroll = require("../models/payroll");
const Employee = require("../models/Employee");
const { calculateDeductions } = require("../services/payrollService");

exports.getAllPayrolls = asyncHandler(async (req, res) => {
    const { month, year } = req.query;
    const query = {};
    
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const payrolls = await Payroll.find(query)
        .populate({
            path: "employee",
            select: "name employeeId department designation",
            populate: { path: "user", select: "name" }
        })
        .sort({ year: -1, month: -1 });

    res.json(payrolls);
});

// ===============================
// Generate Payroll
// ===============================
exports.generatePayroll = asyncHandler(async (req, res) => {
  const { employeeId, month, year } = req.body;

  const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
  if (existingPayroll) {
    return res.status(200).json(existingPayroll);
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

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

  const deductionResult = await calculateDeductions(
    employeeId,
    month,
    year,
    basic,
    employee.monthlyOffDays ?? 3
  );

  const netSalary = Math.max(0, basic + allowance - deductionResult.total);

  try {
    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      basicSalary:       basic,
      allowance,
      deductions:        deductionResult.total,
      advanceDeduction:  deductionResult.advanceDeduction,
      leaveDeduction:    deductionResult.leaveDeduction,
      extraOffDeduction: deductionResult.extraOffDeduction,
      extraOffDays:      deductionResult.extraOffDays,
      workingDays:       deductionResult.workingDays,
      presentDays:       deductionResult.presentDays,
      netSalary,
      status: "Generated"
    });

    if (deductionResult.advanceIds && deductionResult.advanceIds.length > 0) {
      await require("../models/Advance").updateMany(
        { _id: { $in: deductionResult.advanceIds } },
        { $set: { status: "Paid" } }
      );
    }

    res.status(201).json(payroll);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Payroll already generated for this employee for this month"
      });
    }
    throw err;
  }
});

exports.getPayrollOverview = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const targetMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

  const employees = await Employee.find({
    employmentStatus: "Active",
    isDeleted: false
  }).populate("user", "name email");

  const overview = await Promise.all(
    employees.map(async (emp) => {
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
        emp.monthlyOffDays ?? 3
      );

      const netSalary = basic + allowance - deductionResult.total;

      const payroll = await Payroll.findOne({
        employee: emp._id,
        month: targetMonth,
        year: targetYear
      });

      return {
        employeeId:        emp._id,
        employeeCode:      emp.employeeId,
        name:              emp.name || (emp.user && emp.user.name) || "",
        department:        emp.department,
        designation:       emp.designation,
        basicSalary:       basic,
        allowance,
        workingDays:       deductionResult.workingDays,
        presentDays:       deductionResult.presentDays,
        unpaidLeaveDays:   deductionResult.unpaidDays || 0,
        leaveDeduction:    deductionResult.leaveDeduction,
        advanceDeduction:  deductionResult.advanceDeduction,
        extraOffDeduction: deductionResult.extraOffDeduction,
        extraOffDays:      deductionResult.extraOffDays,
        totalDeductions:   deductionResult.total,
        netSalary,
        payrollStatus: payroll ? payroll.status : "Not Generated",
        payrollId:     payroll ? payroll._id : null
      };
    })
  );

  res.json(overview);
});

// ===============================
// Payroll Ledger Breakdown
// ===============================
exports.getPayrollBreakdown = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate({
      path: "employee",
      select: "name employeeId department designation salary monthlyOffDays",
      populate: { path: "user", select: "name" }
    });

  if (!payroll) return res.status(404).json({ message: "Payroll not found" });

  const emp = payroll.employee;
  const rawSalary = emp.salary;
  const basic = typeof rawSalary === "number" ? rawSalary
    : rawSalary?.basic ?? 0;
  const allowance = typeof rawSalary === "object" && typeof rawSalary?.allowance === "number"
    ? rawSalary.allowance : 0;

  // Always recalculate fresh so advance changes after generation are reflected
  const deductionResult = await calculateDeductions(
    emp._id, payroll.month, payroll.year, basic, emp.monthlyOffDays ?? 3
  );

  res.json({
    employeeName:      emp.name || emp.user?.name || "",
    employeeCode:      emp.employeeId,
    department:        emp.department,
    designation:       emp.designation,
    monthlyOffDays:    emp.monthlyOffDays ?? 3,
    month:             payroll.month,
    year:              payroll.year,
    status:            payroll.status,
    basicSalary:       basic,
    allowance,
    grossSalary:       basic + allowance,
    workingDays:       deductionResult.workingDays,
    presentDays:       deductionResult.presentDays,
    leaveDeduction:    deductionResult.leaveDeduction,
    unpaidDays:        deductionResult.unpaidDays,
    advanceDeduction:  deductionResult.advanceDeduction,
    extraOffDeduction: deductionResult.extraOffDeduction,
    extraOffDays:      deductionResult.extraOffDays,
    totalDeductions:   deductionResult.total,
    netSalary:         Math.max(0, basic + allowance - deductionResult.total),
  });
});

// ===============================
// Approve Payroll
// ===============================
exports.approvePayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    return res.status(404).json({ message: "Payroll not found" });
  }

  payroll.status = "Approved";
  await payroll.save();

  res.json({ message: "Payroll approved successfully" });
});

// ===============================
// Payroll History
// ===============================
exports.getPayrollHistory = asyncHandler(async (req, res) => {
  const records = await Payroll.find({
    employee: req.params.employeeId
  }).sort({ year: -1, month: -1 });

  res.json(records);
});
