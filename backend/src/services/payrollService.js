const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Advance = require("../models/Advance");
const Settings = require("../models/Settings");

exports.calculateDeductions = async (employeeId, month, year, basicSalary) => {
  const unpaidLeaves = await Leave.find({
    employee: employeeId,
    paid: false,
    status: "Approved",
    fromDate: {
      $gte: new Date(year, month - 1, 1),
      $lte: new Date(year, month, 0)
    }
  });

  const unpaidDays = unpaidLeaves.reduce(
    (sum, l) => sum + l.totalDays,
    0
  );

  const perDay = basicSalary / 30;
  const leaveDeduction = unpaidDays * perDay;

  const advances = await Advance.find({
    employee: employeeId,
    month,
    year,
    status: "Approved"
  });

  const advanceDeduction = advances.reduce(
    (sum, a) => sum + a.amount,
    0
  );

  const settings = await Settings.findOne();
  const taxPercentage =
    (settings &&
      settings.payroll &&
      typeof settings.payroll.taxPercentage === "number")
      ? settings.payroll.taxPercentage
      : 0;

  const taxDeduction = (basicSalary * taxPercentage) / 100;

  const totalDeductions = leaveDeduction + advanceDeduction + taxDeduction;

  return {
    total: totalDeductions,
    leaveDeduction,
    advanceDeduction,
    taxDeduction,
    advanceIds: advances.map(a => a._id)
  };
};
