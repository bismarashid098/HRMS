const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

exports.calculateDeductions = async (employeeId, month, year, basicSalary) => {
  // unpaid leaves in month
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
  return unpaidDays * perDay;
};
