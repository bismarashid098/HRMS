const {
  getAttendanceSummary,
  getLeaveSummary,
  getPayrollSummary
} = require("../services/reportService");
const Advance  = require("../models/Advance");
const Employee = require("../models/Employee");

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

/**
 * Advance Report
 * GET /api/reports/advances?search=&status=&from=&to=&page=&limit=
 */
exports.advanceReport = async (req, res) => {
  const { search, status, from, to, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build employee filter if searching by name
  let employeeIds;
  if (search) {
    const employees = await Employee.find({
      name: { $regex: search, $options: "i" },
      isDeleted: false
    }).select("_id");
    employeeIds = employees.map(e => e._id);
  }

  // Build query
  const query = {};
  if (employeeIds) query.employee = { $in: employeeIds };
  if (status && status !== "All") query.status = status;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to)   query.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
  }

  const [advances, total, allForSummary] = await Promise.all([
    Advance.find(query)
      .populate({ path: "employee", select: "name employeeId department" })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Advance.countDocuments(query),
    Advance.find(query).select("status amount")
  ]);

  const summary = {
    totalRequests: total,
    approved:  allForSummary.filter(a => a.status === "Approved" || a.status === "Paid").length,
    rejected:  allForSummary.filter(a => a.status === "Rejected").length,
    pending:   allForSummary.filter(a => a.status === "Pending").length,
    totalAmount: allForSummary
      .filter(a => a.status === "Approved" || a.status === "Paid")
      .reduce((s, a) => s + (a.amount || 0), 0)
  };

  const records = advances.map(a => ({
    _id:           a._id,
    employeeName:  a.employee?.name || "—",
    employeeCode:  a.employee?.employeeId || "",
    department:    a.employee?.department || "",
    amount:        a.amount,
    requestedDate: a.date || a.createdAt,
    approvedDate:  (a.status === "Approved" || a.status === "Paid") ? a.updatedAt : null,
    month:         a.month,
    year:          a.year,
    reason:        a.reason,
    status:        a.status
  }));

  res.json({ records, total, summary });
};
