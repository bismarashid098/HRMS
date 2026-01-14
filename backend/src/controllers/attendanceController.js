const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// helper to normalize date (00:00)
const normalizeDate = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Punch In
 * POST /api/attendance/punch-in
 * Admin, HR, Employee
 */
exports.punchIn = async (req, res) => {
  const { employeeId } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const today = normalizeDate(new Date());

  let attendance = await Attendance.findOne({
    employee: employeeId,
    date: today
  });

  if (attendance && attendance.punchIn) {
    return res.status(400).json({ message: "Already punched in" });
  }

  if (!attendance) {
    attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      punchIn: new Date()
    });
  } else {
    attendance.punchIn = new Date();
    await attendance.save();
  }

  res.json({ message: "Punch in successful", attendance });
};

/**
 * Punch Out
 * POST /api/attendance/punch-out
 */
exports.punchOut = async (req, res) => {
  const { employeeId } = req.body;

  const today = normalizeDate(new Date());

  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: today
  });

  if (!attendance || !attendance.punchIn) {
    return res.status(400).json({ message: "Punch in first" });
  }

  if (attendance.punchOut) {
    return res.status(400).json({ message: "Already punched out" });
  }

  attendance.punchOut = new Date();
  await attendance.save();

  res.json({ message: "Punch out successful", attendance });
};

/**
 * Monthly Attendance
 * GET /api/attendance?employeeId=&month=&year=
 * Admin, HR
 */
exports.getMonthlyAttendance = async (req, res) => {
  const { employeeId, month, year } = req.query;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const records = await Attendance.find({
    employee: employeeId,
    date: { $gte: start, $lte: end }
  }).sort({ date: 1 });

  res.json(records);
};

/**
 * Request Correction
 * POST /api/attendance/correction
 */
exports.requestCorrection = async (req, res) => {
  const { attendanceId, reason } = req.body;

  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) {
    return res.status(404).json({ message: "Attendance not found" });
  }

  attendance.correctionRequest = {
    requested: true,
    reason,
    approved: false
  };

  await attendance.save();
  res.json({ message: "Correction requested" });
};

/**
 * Approve Correction
 * PUT /api/attendance/correction/:id
 * Admin, HR
 */
exports.approveCorrection = async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance || !attendance.correctionRequest.requested) {
    return res.status(400).json({ message: "No correction request found" });
  }

  attendance.correctionRequest.approved = true;
  attendance.correctionRequest.requested = false;

  await attendance.save();
  res.json({ message: "Correction approved" });
};
