const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Settings = require("../models/Settings");
const Leave = require("../models/Leave");
const asyncHandler = require("express-async-handler");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

  if (attendance && attendance.isLocked)
    return res.status(400).json({ message: "Attendance is locked for payroll period" });

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
  if (attendance.isLocked)
    return res.status(400).json({ message: "Attendance is locked for payroll period" });

  attendance.punchOut = new Date();

  const settings = await Settings.findOne();
  const workingStart = settings?.attendance?.workingHours?.start || "09:00";
  const lateAfterMinutes = settings?.attendance?.lateAfterMinutes || 15;
  const halfDayAfterMinutes = settings?.attendance?.halfDayAfterMinutes || 240;
  const standardWorkingMinutes = (settings?.payroll?.overtimeRatePerHour != null ? 8 : 8) * 60;

  const [startHour, startMinute] = workingStart.split(":").map(Number);
  const punchInDate = new Date(attendance.punchIn);
  const scheduledStart = new Date(punchInDate);
  scheduledStart.setHours(startHour || 9, startMinute || 0, 0, 0);

  const minutesLate = Math.max(0, Math.round((punchInDate - scheduledStart) / (1000 * 60)));

  if (minutesLate >= halfDayAfterMinutes) attendance.status = "Half Day";
  else if (minutesLate >= lateAfterMinutes) attendance.status = "Late";
  else attendance.status = "Present";

  // Calculate working hours
  const punchOutDate = new Date(attendance.punchOut);
  const totalMs = punchOutDate - punchInDate;
  const workingMinutes = Math.max(0, Math.floor(totalMs / (1000 * 60)));
  attendance.workingHours = parseFloat((workingMinutes / 60).toFixed(2));
  attendance.lateMinutes = minutesLate;
  attendance.overtimeMinutes = Math.max(0, workingMinutes - standardWorkingMinutes);

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

  const allowed = ["Present", "Absent", "Late", "Half Day", "Half Leave", "Full Leave", "Holiday", "Weekend", "Work From Home"];
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

  if (attendance && attendance.isLocked) {
    return res.status(400).json({ message: "Attendance is locked for payroll period" });
  }

  if (!attendance) attendance = new Attendance({ employee: employeeId, date: day });

  attendance.status = status;
  attendance.punchIn = punchInDate;
  attendance.punchOut = punchOutDate;

  // Calculate working hours if both times provided
  if (punchInDate && punchOutDate) {
    const mins = Math.max(0, Math.floor((punchOutDate - punchInDate) / (1000 * 60)));
    attendance.workingHours = parseFloat((mins / 60).toFixed(2));
  }

  await attendance.save();
  res.json({ message: "Attendance updated manually", attendance });
});

/* ──────────────────────────────────────────────────────────────
   Monthly Attendance
   GET /api/attendance/monthly?employeeId=&month=&year=
────────────────────────────────────────────────────────────── */
exports.getMonthlyAttendance = asyncHandler(async (req, res) => {
  let { employeeId, month, year, day } = req.query;
  if (!month || !year) return res.status(400).json({ message: "Month and year required" });

  let targetEmployeeId = employeeId;
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
   Daily Attendance – all active employees merged with attendance
   GET /api/attendance/daily?date=&page=&limit=&search=&status=
────────────────────────────────────────────────────────────── */
exports.getDailyAttendance = asyncHandler(async (req, res) => {
  const { date, page = 1, limit = 20, search, status } = req.query;
  const targetDate = normalizeDate(new Date(date || Date.now()));
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build employee filter
  const empFilter = { isDeleted: { $ne: true }, employmentStatus: "Active" };
  if (search) {
    const escaped = escapeRegex(search);
    const re = new RegExp(escaped, "i");
    empFilter.$or = [{ name: re }, { employeeId: re }, { department: re }];
  }

  const allEmployees = await Employee.find(empFilter, "name employeeId department designation dutyStartTime").lean();
  const empIds = allEmployees.map((e) => e._id);

  const attRecords = await Attendance.find({ employee: { $in: empIds }, date: targetDate }).lean();

  const attMap = {};
  attRecords.forEach((a) => { attMap[a.employee.toString()] = a; });

  let records = allEmployees.map((emp) => {
    const att = attMap[emp._id.toString()];
    return {
      _id: att?._id || null,
      employeeId: emp._id,
      employeeCode: emp.employeeId,
      name: emp.name,
      department: emp.department,
      designation: emp.designation,
      shift: emp.dutyStartTime || null,
      date: targetDate,
      punchIn: att?.punchIn || null,
      punchOut: att?.punchOut || null,
      status: att?.status || null,
      workingHours: att?.workingHours || 0,
      lateMinutes: att?.lateMinutes || 0,
      overtimeMinutes: att?.overtimeMinutes || 0,
      remarks: att?.remarks || ""
    };
  });

  if (status && status !== "All") {
    if (status === "Unmarked") {
      records = records.filter((r) => !r.status);
    } else {
      records = records.filter((r) => r.status === status);
    }
  }

  const total = records.length;
  const paginated = records.slice(skip, skip + limitNum);

  res.json({ records: paginated, total, page: pageNum, limit: limitNum });
});

/* ──────────────────────────────────────────────────────────────
   Bulk Manual Mark
   POST /api/attendance/bulk-manual
────────────────────────────────────────────────────────────── */
exports.bulkManualMark = asyncHandler(async (req, res) => {
  const { records } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: "records array is required" });
  }

  const VALID_STATUSES = ["Present", "Absent", "Late", "Half Day", "Half Leave", "Full Leave", "Holiday", "Weekend", "Work From Home"];

  let saved = 0;
  const errors = [];

  await Promise.all(
    records.map(async (item) => {
      const { employeeId, date, status, punchIn, punchOut, remarks } = item;

      if (!employeeId || !status || !date) {
        errors.push({ employeeId, error: "Missing required fields" });
        return;
      }
      if (!VALID_STATUSES.includes(status)) {
        errors.push({ employeeId, error: `Invalid status: ${status}` });
        return;
      }

      const day = normalizeDate(new Date(date));

      // Check if locked
      const existing = await Attendance.findOne({ employee: employeeId, date: day }).select("isLocked");
      if (existing?.isLocked) {
        errors.push({ employeeId, error: "Attendance is locked for payroll period" });
        return;
      }

      const dateStr = day.toISOString().slice(0, 10);
      const punchInDate = punchIn ? new Date(`${dateStr}T${punchIn}:00`) : null;
      const punchOutDate = punchOut ? new Date(`${dateStr}T${punchOut}:00`) : null;

      let workingHours = 0;
      if (punchInDate && punchOutDate) {
        const mins = Math.max(0, Math.floor((punchOutDate - punchInDate) / (1000 * 60)));
        workingHours = parseFloat((mins / 60).toFixed(2));
      }

      try {
        await Attendance.findOneAndUpdate(
          { employee: employeeId, date: day },
          { $set: { status, punchIn: punchInDate, punchOut: punchOutDate, workingHours, remarks: remarks || "" } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        saved += 1;
      } catch (err) {
        errors.push({ employeeId, error: err.message });
      }
    })
  );

  res.json({
    saved,
    errors: errors.length > 0 ? errors : undefined,
    message: `${saved} attendance record${saved !== 1 ? "s" : ""} saved`
  });
});

/* ──────────────────────────────────────────────────────────────
   Range Summary (for attendance report)
   GET /api/attendance/range?from=&to=
────────────────────────────────────────────────────────────── */
exports.getAttendanceRange = asyncHandler(async (req, res) => {
  const { from, to, page = 1, limit = 50 } = req.query;
  if (!from || !to) return res.status(400).json({ message: "from and to dates are required" });

  const start = new Date(from); start.setHours(0, 0, 0, 0);
  const end = new Date(to); end.setHours(23, 59, 59, 999);
  const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const employees = await Employee.find({ isDeleted: { $ne: true }, employmentStatus: "Active" })
    .select("name employeeId department designation")
    .lean()
    .skip(skip)
    .limit(parseInt(limit));

  const totalEmployees = await Employee.countDocuments({ isDeleted: { $ne: true }, employmentStatus: "Active" });

  const empIds = employees.map((e) => e._id);

  const attendanceRecords = await Attendance.find({ employee: { $in: empIds }, date: { $gte: start, $lte: end } }).lean();
  const leaveRecords = await Leave.find({ status: "Approved", employee: { $in: empIds }, fromDate: { $lte: end }, toDate: { $gte: start } }).lean();

  const attByEmp = {};
  attendanceRecords.forEach((r) => {
    const id = r.employee.toString();
    if (!attByEmp[id]) attByEmp[id] = [];
    attByEmp[id].push(r);
  });

  const leaveByEmp = {};
  leaveRecords.forEach((l) => {
    const id = l.employee.toString();
    const lFrom = new Date(Math.max(new Date(l.fromDate), start));
    const lTo = new Date(Math.min(new Date(l.toDate), end));
    const days = Math.round((lTo - lFrom) / (1000 * 60 * 60 * 24)) + 1;
    leaveByEmp[id] = (leaveByEmp[id] || 0) + Math.max(0, days);
  });

  const result = employees.map((emp) => {
    const id = emp._id.toString();
    const recs = attByEmp[id] || [];
    const present = recs.filter((r) => r.status === "Present").length;
    const late = recs.filter((r) => r.status === "Late").length;
    const halfDay = recs.filter((r) => r.status === "Half Day").length;
    const absent = recs.filter((r) => r.status === "Absent").length;
    const onLeave = leaveByEmp[id] || 0;
    const marked = present + late + halfDay + absent;
    const notMarked = Math.max(0, totalDays - marked - onLeave);
    const rate = totalDays > 0 ? Math.round(((present + late * 0.5 + halfDay * 0.5) / totalDays) * 100) : 0;
    return {
      employee: emp._id,
      employeeCode: emp.employeeId,
      name: emp.name,
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

  res.json({ result, total: totalEmployees, page: parseInt(page), limit: parseInt(limit) });
});

/* ──────────────────────────────────────────────────────────────
   Attendance Report (for charts & summary)
   GET /api/attendance/report?from=&to=&search=
────────────────────────────────────────────────────────────── */
exports.getAttendanceReport = asyncHandler(async (req, res) => {
  const { from, to, search } = req.query;
  if (!from || !to) return res.status(400).json({ message: "from and to required" });

  const start = new Date(from); start.setHours(0, 0, 0, 0);
  const end = new Date(to); end.setHours(23, 59, 59, 999);

  let employeeFilter = {};
  if (search) {
    const escaped = escapeRegex(search);
    const empIds = await Employee.find({
      $or: [{ name: new RegExp(escaped, "i") }, { employeeId: new RegExp(escaped, "i") }]
    }).distinct("_id");
    employeeFilter.employee = { $in: empIds };
  }

  const attendanceRecords = await Attendance.find({
    date: { $gte: start, $lte: end },
    ...employeeFilter
  }).lean();

  const dailyMap = new Map();
  attendanceRecords.forEach((att) => {
    const dateKey = att.date.toISOString().slice(0, 10);
    if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, { present: 0, late: 0, halfDay: 0, absent: 0 });
    const day = dailyMap.get(dateKey);
    if (att.status === "Present") day.present++;
    else if (att.status === "Late") day.late++;
    else if (att.status === "Half Day") day.halfDay++;
    else if (att.status === "Absent") day.absent++;
  });

  const daily = Array.from(dailyMap.entries())
    .map(([date, counts]) => ({
      date,
      present: counts.present,
      late: counts.late,
      halfDay: counts.halfDay,
      absent: counts.absent,
      rate:
        counts.present + counts.late + counts.halfDay + counts.absent > 0
          ? Math.round(((counts.present + counts.late * 0.75 + counts.halfDay * 0.5) / (counts.present + counts.late + counts.halfDay + counts.absent)) * 100)
          : 0
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalPresent = daily.reduce((s, d) => s + d.present, 0);
  const totalLate = daily.reduce((s, d) => s + d.late, 0);
  const totalAbsent = daily.reduce((s, d) => s + d.absent, 0);
  const totalHalfDay = daily.reduce((s, d) => s + d.halfDay, 0);

  res.json({ summary: { totalPresent, totalLate, totalAbsent, totalHalfDay }, daily });
});

/* ──────────────────────────────────────────────────────────────
   Correction Request & Approval
────────────────────────────────────────────────────────────── */
exports.requestCorrection = asyncHandler(async (req, res) => {
  const { attendanceId, reason } = req.body;
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) return res.status(404).json({ message: "Attendance not found" });

  // Non-admins can only request for their own attendance
  if (req.user.role !== "Admin") {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee || attendance.employee.toString() !== employee._id.toString()) {
      return res.status(403).json({ message: "Not authorized to request correction for this record" });
    }
  }

  attendance.correctionRequest = { requested: true, reason, approved: false };
  await attendance.save();
  res.json({ message: "Correction requested" });
});

exports.approveCorrection = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance || !attendance.correctionRequest?.requested)
    return res.status(400).json({ message: "No correction request found" });

  const { punchIn, punchOut, status } = req.body;

  if (status) attendance.status = status;
  if (punchIn) attendance.punchIn = new Date(punchIn);
  if (punchOut) attendance.punchOut = new Date(punchOut);

  // Recalculate working hours if both times available
  if (attendance.punchIn && attendance.punchOut) {
    const mins = Math.max(0, Math.floor((new Date(attendance.punchOut) - new Date(attendance.punchIn)) / (1000 * 60)));
    attendance.workingHours = parseFloat((mins / 60).toFixed(2));
  }

  attendance.correctionRequest.approved = true;
  attendance.correctionRequest.requested = false;
  await attendance.save();
  res.json({ message: "Correction approved", attendance });
});
