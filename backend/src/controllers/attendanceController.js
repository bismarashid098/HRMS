const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Settings = require("../models/Settings");
const Leave = require("../models/Leave");

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

  const settings = await Settings.findOne();
  const workingStart = (settings && settings.attendance && settings.attendance.workingHours.start) || "09:00";
  const lateAfterMinutes = (settings && settings.attendance && settings.attendance.lateAfterMinutes) || 15;
  const halfDayAfterMinutes = (settings && settings.attendance && settings.attendance.halfDayAfterMinutes) || 240;

  const [startHour, startMinute] = workingStart.split(":").map(Number);
  const punchInDate = new Date(attendance.punchIn);
  const scheduledStart = new Date(punchInDate);
  scheduledStart.setHours(startHour || 9, startMinute || 0, 0, 0);

  const minutesLate = Math.max(
    0,
    Math.round((punchInDate.getTime() - scheduledStart.getTime()) / (1000 * 60))
  );

  if (minutesLate >= halfDayAfterMinutes) {
    attendance.status = "Half Day";
  } else if (minutesLate >= lateAfterMinutes) {
    attendance.status = "Late";
  } else {
    attendance.status = "Present";
  }

  await attendance.save();

  res.json({ message: "Punch out successful", attendance });
};

exports.manualMark = async (req, res) => {
  const { employeeId, date, status, punchIn, punchOut } = req.body;

  if (!employeeId || !status) {
    return res
      .status(400)
      .json({ message: "Employee and status are required" });
  }

  const allowedStatuses = ["Present", "Absent", "Late", "Half Day"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const targetDate = date ? new Date(date) : new Date();
  if (Number.isNaN(targetDate.getTime())) {
    return res.status(400).json({ message: "Invalid date" });
  }

  const day = normalizeDate(targetDate);
  let punchInDate = null;
  let punchOutDate = null;

  if (status !== "Absent") {
    if (punchIn) {
      const d = new Date(punchIn);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: "Invalid punch in time" });
      }
      punchInDate = d;
    }
    if (punchOut) {
      const d = new Date(punchOut);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: "Invalid punch out time" });
      }
      punchOutDate = d;
    }
  }

  let attendance = await Attendance.findOne({
    employee: employeeId,
    date: day
  });

  if (!attendance) {
    attendance = new Attendance({
      employee: employeeId,
      date: day
    });
  }

  attendance.status = status;
  attendance.punchIn = punchInDate;
  attendance.punchOut = punchOutDate;

  await attendance.save();

  res.json({ message: "Attendance updated manually", attendance });
};

exports.getMonthlyAttendance = async (req, res) => {
  const { employeeId, month, year, day } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: "Month and year are required" });
  }

  let targetEmployeeId = employeeId;

  if (req.user.role === "Employee") {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }
    targetEmployeeId = employee._id.toString();
  }

  if (!targetEmployeeId) {
    return res.status(400).json({ message: "Employee is required" });
  }

  const monthNum = Number(month);
  const yearNum = Number(year);

  let start;
  let end;

  if (day) {
    const dayNum = Number(day);
    start = new Date(yearNum, monthNum - 1, dayNum, 0, 0, 0, 0);
    end = new Date(yearNum, monthNum - 1, dayNum, 23, 59, 59, 999);
  } else {
    start = new Date(yearNum, monthNum - 1, 1, 0, 0, 0, 0);
    end = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
  }

  const records = await Attendance.find({
    employee: targetEmployeeId,
    date: { $gte: start, $lte: end }
  }).sort({ date: 1 });

  res.json(records);
};

exports.getDailyAttendanceList = async (req, res) => {
  const dateParam = req.query.date;
  const baseDate = dateParam ? new Date(dateParam) : new Date();
  baseDate.setHours(0, 0, 0, 0);

  const start = new Date(baseDate);
  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  const employees = await Employee.find({
    isDeleted: false,
    employmentStatus: "Active"
  }).populate("user", "name");

  const attendanceRecords = await Attendance.find({
    date: { $gte: start, $lte: end }
  });

  const leaveRecords = await Leave.find({
    status: "Approved",
    fromDate: { $lte: end },
    toDate: { $gte: start }
  });

  const attendanceMap = new Map();
  attendanceRecords.forEach((record) => {
    attendanceMap.set(record.employee.toString(), record);
  });

  const leaveMap = new Map();
  leaveRecords.forEach((leave) => {
    leaveMap.set(leave.employee.toString(), leave);
  });

  const list = employees.map((emp) => {
    const record = attendanceMap.get(emp._id.toString());
    const leave = leaveMap.get(emp._id.toString());

    let status = record ? record.status : "Not Marked";
    let onLeave = false;
    let leaveType = null;

    if ((!record || record.status === "Not Marked") && leave) {
      status = "On Leave";
      onLeave = true;
      leaveType = leave.type;
    }

    return {
      employee: emp._id,
      employeeCode: emp.employeeId,
      name: emp.name || (emp.user && emp.user.name) || "",
      department: emp.department,
      designation: emp.designation,
      status,
      onLeave,
      leaveType,
      punchIn: record ? record.punchIn : null,
      punchOut: record ? record.punchOut : null,
      attendanceId: record ? record._id : null
    };
  });

  res.json(list);
};

/* ── Range Summary: GET /attendance/range?from=&to= ── */
exports.getAttendanceRange = async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ message: "from and to dates are required" });

  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const employees = await Employee.find({
    isDeleted: false,
    employmentStatus: "Active"
  }).populate("user", "name");

  const attendanceRecords = await Attendance.find({
    date: { $gte: start, $lte: end }
  });

  const leaveRecords = await Leave.find({
    status: "Approved",
    fromDate: { $lte: end },
    toDate: { $gte: start }
  });

  // Group attendance by employee
  const attByEmp = {};
  attendanceRecords.forEach((r) => {
    const id = r.employee.toString();
    if (!attByEmp[id]) attByEmp[id] = [];
    attByEmp[id].push(r);
  });

  // Calculate leave days per employee within the range
  const leaveByEmp = {};
  leaveRecords.forEach((l) => {
    const id = l.employee.toString();
    const lFrom = new Date(Math.max(new Date(l.fromDate), start));
    const lTo   = new Date(Math.min(new Date(l.toDate), end));
    const days  = Math.round((lTo - lFrom) / (1000 * 60 * 60 * 24)) + 1;
    leaveByEmp[id] = (leaveByEmp[id] || 0) + Math.max(0, days);
  });

  const result = employees.map((emp) => {
    const id   = emp._id.toString();
    const recs = attByEmp[id] || [];
    const present  = recs.filter((r) => r.status === "Present").length;
    const late     = recs.filter((r) => r.status === "Late").length;
    const halfDay  = recs.filter((r) => r.status === "Half Day").length;
    const absent   = recs.filter((r) => r.status === "Absent").length;
    const onLeave  = leaveByEmp[id] || 0;
    const marked   = present + late + halfDay + absent;
    const notMarked = Math.max(0, totalDays - marked - onLeave);
    const rate     = totalDays > 0 ? Math.round(((present + late * 0.5 + halfDay * 0.5) / totalDays) * 100) : 0;

    return {
      employee:     emp._id,
      employeeCode: emp.employeeId,
      name:         emp.name || (emp.user && emp.user.name) || "",
      department:   emp.department,
      designation:  emp.designation,
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
