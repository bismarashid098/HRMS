const {
  getAttendanceSummary,
  getLeaveSummary,
  getPayrollSummary
} = require("../services/reportService");

/**
 * Attendance Report
 * GET /api/reports/attendance?employeeId=&month=&year=
 */
exports.attendanceReport = async (req, res) => {
  const { employeeId, month, year } = req.query;
  const data = await getAttendanceSummary(employeeId, Number(month), Number(year));
  res.json(data);
};

/**
 * Leave Report
 * GET /api/reports/leaves?employeeId=&year=
 */
exports.leaveReport = async (req, res) => {
  const { employeeId, year } = req.query;
  const data = await getLeaveSummary(employeeId, Number(year));
  res.json(data);
};

/**
 * Payroll Report
 * GET /api/reports/payroll?employeeId=&month=&year=
 */
exports.payrollReport = async (req, res) => {
  const { employeeId, month, year } = req.query;
  const data = await getPayrollSummary(employeeId, Number(month), Number(year));
  res.json(data);
};
