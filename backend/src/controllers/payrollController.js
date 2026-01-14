const asyncHandler = require("express-async-handler");
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const { calculateDeductions } = require("../services/payrollService");

// ===============================
// Generate Payroll
// ===============================
exports.generatePayroll = asyncHandler(async (req, res) => {
  const { employeeId, month, year } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const basic = employee.salary.basic;
  const allowance = employee.salary.allowance || 0;

  const deductions = await calculateDeductions(
    employeeId,
    month,
    year,
    basic
  );

  const netSalary = basic + allowance - deductions;

  try {
    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      basicSalary: basic,
      allowance,
      deductions,
      netSalary
    });

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
