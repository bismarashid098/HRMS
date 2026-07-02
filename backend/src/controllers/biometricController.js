const asyncHandler = require("express-async-handler");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Settings = require("../models/Settings");
const { logAudit } = require("../services/auditService");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".csv", ".xlsx", ".xls"].includes(ext)) cb(null, true);
    else cb(new Error("Only CSV, XLS, and XLSX files are allowed"));
  },
});

const normalizeDate = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// POST /api/biometric/import
exports.importAttendance = [
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { raw: false, defval: "" });

    if (!rows.length) return res.status(400).json({ message: "File is empty or unreadable" });

    const settings = await Settings.findOne();
    const workingStart = settings?.attendance?.workingHours?.start || "09:00";
    const lateAfterMinutes = Number(settings?.attendance?.lateAfterMinutes ?? 15);
    const halfDayAfterMinutes = Number(settings?.attendance?.halfDayAfterMinutes ?? 240);
    const [startHour, startMinute] = workingStart.split(":").map(Number);

    const employees = await Employee.find({ isDeleted: { $ne: true } }).select(
      "_id biometricId employeeId name"
    );
    const byBiometric = {};
    const byCode = {};
    employees.forEach((e) => {
      if (e.biometricId) byBiometric[String(e.biometricId).trim().toUpperCase()] = e;
      if (e.employeeId) byCode[String(e.employeeId).trim().toUpperCase()] = e;
    });

    const results = { inserted: 0, updated: 0, skipped: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      // Accept multiple column name variants from different machine export formats
      const rawCode = (
        row["Employee Code"] ||
        row["EmployeeCode"] ||
        row["employee_code"] ||
        row["Emp Code"] ||
        row["EmpCode"] ||
        row["Biometric ID"] ||
        row["BiometricID"] ||
        row["biometric_id"] ||
        row["Card No"] ||
        row["ID"] ||
        ""
      )
        .toString()
        .trim();

      const rawDate =
        row["Date"] || row["date"] || row["Attendance Date"] || row["AttendanceDate"] || "";
      const rawPunchIn =
        row["Punch In"] ||
        row["PunchIn"] ||
        row["punch_in"] ||
        row["Check In"] ||
        row["CheckIn"] ||
        row["Time In"] ||
        "";
      const rawPunchOut =
        row["Punch Out"] ||
        row["PunchOut"] ||
        row["punch_out"] ||
        row["Check Out"] ||
        row["CheckOut"] ||
        row["Time Out"] ||
        "";
      const rawStatus = (row["Status"] || row["status"] || "").trim();

      if (!rawCode) {
        results.errors.push({ row: rowNum, reason: "Missing employee code" });
        continue;
      }
      if (!rawDate) {
        results.errors.push({ row: rowNum, code: rawCode, reason: "Missing date" });
        continue;
      }

      const employee =
        byCode[rawCode.toUpperCase()] || byBiometric[rawCode.toUpperCase()];
      if (!employee) {
        results.errors.push({ row: rowNum, code: rawCode, reason: "Employee not found" });
        continue;
      }

      let dateObj;
      if (rawDate instanceof Date) {
        dateObj = rawDate;
      } else {
        dateObj = new Date(rawDate);
      }
      if (isNaN(dateObj.getTime())) {
        results.errors.push({ row: rowNum, code: rawCode, reason: `Invalid date: "${rawDate}"` });
        continue;
      }
      const normalDate = normalizeDate(dateObj);
      const dateStr = normalDate.toDateString();

      let punchIn = null;
      let punchOut = null;
      if (rawPunchIn) {
        const t = new Date(`${dateStr} ${rawPunchIn}`);
        if (!isNaN(t.getTime())) punchIn = t;
      }
      if (rawPunchOut) {
        const t = new Date(`${dateStr} ${rawPunchOut}`);
        if (!isNaN(t.getTime())) punchOut = t;
      }

      // Auto-calculate status from punch-in time if not supplied
      let status = "Present";
      if (rawStatus && ["Present", "Absent", "Late", "Half Day"].includes(rawStatus)) {
        status = rawStatus;
      } else if (punchIn) {
        const scheduledStart = new Date(normalDate);
        scheduledStart.setHours(startHour, startMinute, 0, 0);
        const minutesLate = Math.max(
          0,
          Math.round((punchIn - scheduledStart) / (1000 * 60))
        );
        if (minutesLate >= halfDayAfterMinutes) status = "Half Day";
        else if (minutesLate >= lateAfterMinutes) status = "Late";
        else status = "Present";
      } else {
        status = "Absent";
      }

      try {
        const existing = await Attendance.findOne({
          employee: employee._id,
          date: normalDate,
        });

        if (existing?.isLocked) {
          results.skipped++;
          continue;
        }

        if (existing) {
          if (punchIn) existing.punchIn = punchIn;
          if (punchOut) existing.punchOut = punchOut;
          existing.status = status;
          await existing.save();
          results.updated++;
        } else {
          await Attendance.create({
            employee: employee._id,
            date: normalDate,
            punchIn,
            punchOut,
            status,
          });
          results.inserted++;
        }
      } catch (err) {
        results.errors.push({ row: rowNum, code: rawCode, reason: err.message });
      }
    }

    logAudit(req, {
      module: "Biometric",
      action: "Import",
      recordName: req.file.originalname,
      description: `${req.user?.name} imported biometric attendance — ${results.inserted} inserted, ${results.updated} updated, ${results.skipped} skipped, ${results.errors.length} errors (${rows.length} total rows)`,
      newValues: { inserted: results.inserted, updated: results.updated, skipped: results.skipped, errors: results.errors.length },
    });

    res.json({
      message: "Import complete",
      total: rows.length,
      inserted: results.inserted,
      updated: results.updated,
      skipped: results.skipped,
      errorCount: results.errors.length,
      errors: results.errors.slice(0, 50),
    });
  }),
];

// GET /api/biometric/template
exports.downloadTemplate = asyncHandler(async (req, res) => {
  const wb = xlsx.utils.book_new();
  const data = [
    ["Employee Code", "Date", "Punch In", "Punch Out", "Status"],
    ["EMP001", "2024-06-01", "09:00", "17:30", "Present"],
    ["EMP002", "2024-06-01", "09:25", "17:30", "Late"],
    ["EMP003", "2024-06-01", "13:00", "17:30", "Half Day"],
    ["EMP004", "2024-06-01", "", "", "Absent"],
  ];
  const ws = xlsx.utils.aoa_to_sheet(data);
  ws["!cols"] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];
  xlsx.utils.book_append_sheet(wb, ws, "Attendance Template");

  // Instructions sheet
  const instr = [
    ["Column", "Required", "Description"],
    ["Employee Code", "YES", "Must match employeeId (e.g. EMP001) or Biometric ID on the employee record"],
    ["Date", "YES", "YYYY-MM-DD format recommended (e.g. 2024-06-01)"],
    ["Punch In", "NO", "HH:MM or HH:MM:SS (24-hour). Leave blank for Absent."],
    ["Punch Out", "NO", "HH:MM or HH:MM:SS (24-hour). Can be blank."],
    ["Status", "NO", "Present | Late | Half Day | Absent. Auto-calculated from Punch In if omitted."],
    ["", "", ""],
    ["Notes", "", "Locked attendance records will be skipped."],
    ["", "", "If a record already exists for the same employee+date it will be updated (not duplicated)."],
  ];
  const ws2 = xlsx.utils.aoa_to_sheet(instr);
  ws2["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 70 }];
  xlsx.utils.book_append_sheet(wb, ws2, "Instructions");

  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  res.set({
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition":
      'attachment; filename="biometric_attendance_template.xlsx"',
  });
  res.send(buffer);
});

// GET /api/biometric/export
exports.exportAttendance = asyncHandler(async (req, res) => {
  const { from, to, format = "xlsx" } = req.query;
  if (!from || !to)
    return res.status(400).json({ message: "from and to query params are required" });

  const fromDate = normalizeDate(new Date(from));
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const records = await Attendance.find({
    date: { $gte: fromDate, $lte: toDate },
  })
    .populate("employee", "name employeeId biometricId department designation")
    .sort({ date: 1 });

  const rows = records.map((r) => ({
    "Employee Code": r.employee?.employeeId || "",
    "Biometric ID": r.employee?.biometricId || "",
    "Employee Name": r.employee?.name || "",
    "Department": r.employee?.department || "",
    "Designation": r.employee?.designation || "",
    "Date": new Date(r.date).toISOString().split("T")[0],
    "Punch In": r.punchIn
      ? new Date(r.punchIn).toLocaleTimeString("en-PK", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "",
    "Punch Out": r.punchOut
      ? new Date(r.punchOut).toLocaleTimeString("en-PK", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "",
    "Status": r.status,
    "Locked": r.isLocked ? "Yes" : "No",
  }));

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 14 },
    { wch: 13 },
    { wch: 22 },
    { wch: 16 },
    { wch: 20 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 8 },
  ];
  xlsx.utils.book_append_sheet(wb, ws, "Attendance");

  if (format === "csv") {
    const csv = xlsx.utils.sheet_to_csv(ws);
    res.set({
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="attendance_${from}_to_${to}.csv"`,
    });
    return res.send(csv);
  }

  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  res.set({
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="attendance_${from}_to_${to}.xlsx"`,
  });
  res.send(buffer);
});
