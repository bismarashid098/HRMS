const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Settings = require("../models/Settings");
const Leave = require("../models/Leave");
const asyncHandler = require("express-async-handler");

const normalizeDate = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

/* ──────────────────────────────────────────────────────────────
   Punch In
   POST /api/attendance/punch-in
────────────────────────────────────────────────────────────── */
exports.punchIn = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;
  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  const today = normalizeDate(new Date());
  let attendance = await Attendance.findOne({ employee: employeeId, date: today });

  if (attendance && attendance.punchIn)
    return res.status(400).json({ message: "Already punched in" });

  if (!attendance) {
    attendance = await Attendance.create({ employee: employeeId, date: today, punchIn: new Date() });
  } else {
    attendance.punchIn = new Date();
    await attendance.save();
  }
  res.json({ message: "Punch in successful", attendance });
});

/* ──────────────────────────────────────────────────────────────
   Punch Out
   POST /api/attendance/punch-out
────────────────────────────────────────────────────────────── */
exports.punchOut = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;
  const today = normalizeDate(new Date());
  const attendance = await Attendance.findOne({ employee: employeeId, date: today });

  if (!attendance || !attendance.punchIn)
    return res.status(400).json({ message: "Punch in first" });
  if (attendance.punchOut)
    return res.status(400).json({ message: "Already punched out" });

  attendance.punchOut = new Date();

  const settings = await Settings.findOne();
  const workingStart = (settings?.attendance?.workingHours?.start) || "09:00";
  const lateAfterMinutes = (settings?.attendance?.lateAfterMinutes) || 15;
  const halfDayAfterMinutes = (settings?.attendance?.halfDayAfterMinutes) || 240;

  const [startHour, startMinute] = workingStart.split(":").map(Number);
  const punchInDate = new Date(attendance.punchIn);
  const scheduledStart = new Date(punchInDate);
  scheduledStart.setHours(startHour || 9, startMinute || 0, 0, 0);

  const minutesLate = Math.max(0, Math.round((punchInDate - scheduledStart) / (1000 * 60)));

  if (minutesLate >= halfDayAfterMinutes) attendance.status = "Half Day";
  else if (minutesLate >= lateAfterMinutes) attendance.status = "Late";
  else attendance.status = "Present";

  await attendance.save();
  res.json({ message: "Punch out successful", attendance });
});

/* ──────────────────────────────────────────────────────────────
   Manual Mark
   POST /api/attendance/manual
────────────────────────────────────────────────────────────── */
exports.manualMark = asyncHandler(async (req, res) => {
  const { employeeId, date, status, punchIn, punchOut } = req.body;
  if (!employeeId || !status) return res.status(400).json({ message: "Employee and status are required" });

  const allowed = ["Present", "Absent", "Late", "Half Day"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  const targetDate = date ? new Date(date) : new Date();
  if (isNaN(targetDate)) return res.status(400).json({ message: "Invalid date" });

  const day = normalizeDate(targetDate);
  let punchInDate = null, punchOutDate = null;

  if (status !== "Absent") {
    if (punchIn) {
      const d = new Date(punchIn);
      if (isNaN(d)) return res.status(400).json({ message: "Invalid punch in time" });
      punchInDate = d;
    }
    if (punchOut) {
      const d = new Date(punchOut);
      if (isNaN(d)) return res.status(400).json({ message: "Invalid punch out time" });
      punchOutDate = d;
    }
  }

  let attendance = await Attendance.findOne({ employee: employeeId, date: day });
  if (!attendance) attendance = new Attendance({ employee: employeeId, date: day });

  attendance.status = status;
  attendance.punchIn = punchInDate;
  attendance.punchOut = punchOutDate;
  await attendance.save();

  res.json({ message: "Attendance updated manually", attendance });
});

/* ──────────────────────────────────────────────────────────────
   Monthly Attendance (for ledger)
   GET /api/attendance/monthly?employeeId=&month=&year=
────────────────────────────────────────────────────────────── */
exports.getMonthlyAttendance = asyncHandler(async (req, res) => {
  let { employeeId, month, year, day } = req.query;
  if (!month || !year) return res.status(400).json({ message: "Month and year required" });

  let targetEmployeeId = employeeId;
  if (req.user.role === "Employee") {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });
    targetEmployeeId = employee._id.toString();
  }
  if (!targetEmployeeId) return res.status(400).json({ message: "Employee required" });

  const monthNum = Number(month);
  const yearNum = Number(year);
  let start, end;
  if (day) {
    start = new Date(yearNum, monthNum - 1, day, 0, 0, 0, 0);
    end = new Date(yearNum, monthNum - 1, day, 23, 59, 59, 999);
  } else {
    start = new Date(yearNum, monthNum - 1, 1, 0, 0, 0, 0);
    end = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
  }

  const records = await Attendance.find({ employee: targetEmployeeId, date: { $gte: start, $lte: end } }).sort({ date: 1 });
  res.json(records);
});

/* ──────────────────────────────────────────────────────────────
   Daily Attendance (with pagination and filters)
   GET /api/attendance/daily?date=&page=&limit=&search=&status=
────────────────────────────────────────────────────────────── */
exports.getDailyAttendance = asyncHandler(async (req, res) => {
  const { date, page = 1, limit = 10, search, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build attendance filter directly (avoid loading all employees)
  let attendanceFilter = { date: normalizeDate(new Date(date)) };
  if (status && status !== 'All') attendanceFilter.status = status;

  // Only query employees when search is provided
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const matchingEmpIds = await Employee.find({
      $or: [
        { name: searchRegex },
        { employeeId: searchRegex },
        { department: searchRegex }
      ]
    }).distinct('_id');
    if (matchingEmpIds.length === 0) {
      return res.json({ records: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
    }
    attendanceFilter.employee = { $in: matchingEmpIds };
  }

  // Run count and paginated fetch in parallel; populate only the needed records
  const [total, attendanceRecords] = await Promise.all([
    Attendance.countDocuments(attendanceFilter),
    Attendance.find(attendanceFilter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('employee', 'name employeeId department designation')
      .lean()
  ]);

  const records = attendanceRecords.map(att => ({
    _id: att._id,
    employee: att.employee?._id,
    employeeCode: att.employee?.employeeId,
    name: att.employee?.name,
    department: att.employee?.department,
    designation: att.employee?.designation,
    status: att.status,
    punchIn: att.punchIn,
    punchOut: att.punchOut,
    date: att.date
  }));

  res.json({ records, total, page: parseInt(page), limit: parseInt(limit) });
});

/* ──────────────────────────────────────────────────────────────
   Range Summary (for attendance report)
   GET /api/attendance/range?from=&to=
────────────────────────────────────────────────────────────── */
exports.getAttendanceRange = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ message: "from and to dates are required" });

  const start = new Date(from); start.setHours(0,0,0,0);
  const end = new Date(to); end.setHours(23,59,59,999);
  const totalDays = Math.round((end - start) / (1000*60*60*24)) + 1;

  const employees = await Employee.find({ isDeleted: { $ne: true }, employmentStatus: "Active" }).populate("user", "name").lean();
  const attendanceRecords = await Attendance.find({ date: { $gte: start, $lte: end } }).lean();
  const leaveRecords = await Leave.find({ status: "Approved", fromDate: { $lte: end }, toDate: { $gte: start } }).lean();

  const attByEmp = {};
  attendanceRecords.forEach(r => {
    const id = r.employee.toString();
    if (!attByEmp[id]) attByEmp[id] = [];
    attByEmp[id].push(r);
  });

  const leaveByEmp = {};
  leaveRecords.forEach(l => {
    const id = l.employee.toString();
    const lFrom = new Date(Math.max(new Date(l.fromDate), start));
    const lTo = new Date(Math.min(new Date(l.toDate), end));
    const days = Math.round((lTo - lFrom) / (1000*60*60*24)) + 1;
    leaveByEmp[id] = (leaveByEmp[id] || 0) + Math.max(0, days);
  });

  const result = employees.map(emp => {
    const id = emp._id.toString();
    const recs = attByEmp[id] || [];
    const present = recs.filter(r => r.status === "Present").length;
    const late = recs.filter(r => r.status === "Late").length;
    const halfDay = recs.filter(r => r.status === "Half Day").length;
    const absent = recs.filter(r => r.status === "Absent").length;
    const onLeave = leaveByEmp[id] || 0;
    const marked = present + late + halfDay + absent;
    const notMarked = Math.max(0, totalDays - marked - onLeave);
    const rate = totalDays > 0 ? Math.round(((present + late*0.5 + halfDay*0.5) / totalDays) * 100) : 0;
    return {
      employee: emp._id,
      employeeCode: emp.employeeId,
      name: emp.name || (emp.user?.name),
      department: emp.department,
      designation: emp.designation,
      totalDays,
      present,
      late,
      halfDay,
      absent,
      onLeave,
      notMarked,
      rate
    };
  });
  res.json(result);
});

/* ──────────────────────────────────────────────────────────────
   Attendance Report (for charts & summary)
   GET /api/attendance/report?from=&to=&search=
────────────────────────────────────────────────────────────── */
exports.getAttendanceReport = asyncHandler(async (req, res) => {
  const { from, to, search } = req.query;
  if (!from || !to) return res.status(400).json({ message: "from and to required" });

  const start = new Date(from); start.setHours(0,0,0,0);
  const end = new Date(to); end.setHours(23,59,59,999);

  let employeeFilter = {};
  if (search) {
    const empIds = await Employee.find({
      $or: [
        { name: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') }
      ]
    }).distinct('_id');
    employeeFilter.employee = { $in: empIds };
  }

  const attendanceRecords = await Attendance.find({
    date: { $gte: start, $lte: end },
    ...employeeFilter
  }).lean();

  // Group by date
  const dailyMap = new Map();
  attendanceRecords.forEach(att => {
    const dateKey = att.date.toISOString().slice(0,10);
    if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, { present: 0, absent: 0 });
    const day = dailyMap.get(dateKey);
    if (att.status === "Present") day.present++;
    else if (att.status === "Absent") day.absent++;
  });

  const daily = Array.from(dailyMap.entries())
    .map(([date, counts]) => ({
      date,
      present: counts.present,
      absent: counts.absent,
      rate: counts.present + counts.absent ? Math.round((counts.present / (counts.present + counts.absent)) * 100) : 0
    }))
    .sort((a,b) => new Date(a.date) - new Date(b.date));

  const totalPresent = daily.reduce((s,d) => s + d.present, 0);
  const totalAbsent = daily.reduce((s,d) => s + d.absent, 0);

  res.json({ summary: { totalPresent, totalAbsent }, daily });
});

/* ──────────────────────────────────────────────────────────────
   Correction Request & Approval
────────────────────────────────────────────────────────────── */
exports.requestCorrection = asyncHandler(async (req, res) => {
  const { attendanceId, reason } = req.body;
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) return res.status(404).json({ message: "Attendance not found" });
  attendance.correctionRequest = { requested: true, reason, approved: false };
  await attendance.save();
  res.json({ message: "Correction requested" });
});

exports.approveCorrection = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance || !attendance.correctionRequest?.requested)
    return res.status(400).json({ message: "No correction request found" });
  attendance.correctionRequest.approved = true;
  attendance.correctionRequest.requested = false;
  await attendance.save();
  res.json({ message: "Correction approved" });
});