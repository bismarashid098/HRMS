const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Payroll = require("../models/Payroll");

exports.getAttendanceSummary = async (employeeId, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const records = await Attendance.find({
    employee: employeeId,
    date: { $gte: start, $lte: end }
  });

  const summary = {
    present: records.filter(r => r.status === "Present").length,
    late: records.filter(r => r.status === "Late").length,
    halfDay: records.filter(r => r.status === "Half Day").length,
    absent: records.filter(r => r.status === "Absent").length
  };

  return summary;
};

exports.getLeaveSummary = async (employeeId, year) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const leaves = await Leave.find({
    employee: employeeId,
    status: "Approved",
    fromDate: { $gte: start, $lte: end }
  });

  return {
    totalLeaves: leaves.length,
    paid: leaves.filter(l => l.paid).length,
    unpaid: leaves.filter(l => !l.paid).length
  };
};

exports.getPayrollSummary = async (employeeId, month, year) => {
  const payroll = await Payroll.findOne({ employee: employeeId, month, year });
  if (!payroll) return null;

  return {
    basicSalary: payroll.basicSalary,
    allowance: payroll.allowance,
    deductions: payroll.deductions,
    netSalary: payroll.netSalary,
    status: payroll.status
  };
};
