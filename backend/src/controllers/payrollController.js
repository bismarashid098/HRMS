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
        .populate("employee", "employeeId department designation")
        .populate({
            path: "employee",
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

  // Check if payroll already exists
  const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
  if (existingPayroll) {
     return res.status(200).json(existingPayroll); // Return existing instead of error
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const basic = employee.salary.basic;
  const allowance = employee.salary.allowance || 0;

  const deductionResult = await calculateDeductions(
    employeeId,
    month,
    year,
    basic
  );

  const netSalary = basic + allowance - deductionResult.total;

  try {
    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      basicSalary: basic,
      allowance,
      deductions: deductionResult.total,
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
