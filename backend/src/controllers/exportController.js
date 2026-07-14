const asyncHandler = require("express-async-handler");
const Payroll = require("../models/payroll");
const Employee = require("../models/Employee");
const Settings = require("../models/Settings");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");

// ── Payslip PDF ───────────────────────────────────────────────────────────────

exports.downloadPayslip = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate("employee");
  if (!payroll) { res.status(404); throw new Error("Payroll record not found"); }

  const emp = payroll.employee;
  const settings = await Settings.findOne();
  const companyName = settings?.company?.name || "WorkSphere HRMS";
  const currency = settings?.currency?.symbol || "PKR";

  const monthName = new Date(payroll.year, payroll.month - 1, 1)
    .toLocaleString("en-US", { month: "long" });

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="payslip-${emp.employeeId || emp._id}-${monthName}-${payroll.year}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).font("Helvetica-Bold").text(companyName, { align: "center" });
  doc.fontSize(12).font("Helvetica").text("SALARY SLIP", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(11).text(`${monthName} ${payroll.year}`, { align: "center" });
  doc.moveDown();

  // Employee info
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  const infoLeft = [
    ["Employee Name", emp.name || "—"],
    ["Employee ID", emp.employeeId || "—"],
    ["Department", emp.department || "—"],
    ["Designation", emp.designation || "—"]
  ];
  const infoRight = [
    ["Bank Account", emp.bankAccountNumber || "—"],
    ["Bank", emp.bankName || "—"],
    ["Joining Date", emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : "—"],
    ["Pay Period", `${monthName} ${payroll.year}`]
  ];

  const startY = doc.y;
  infoLeft.forEach(([k, v], i) => {
    doc.font("Helvetica-Bold").text(k + ":", 50, startY + i * 18);
    doc.font("Helvetica").text(v, 185, startY + i * 18);
  });
  infoRight.forEach(([k, v], i) => {
    doc.font("Helvetica-Bold").text(k + ":", 305, startY + i * 18);
    doc.font("Helvetica").text(v, 430, startY + i * 18);
  });

  doc.moveDown(5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  // Earnings / Deductions table
  const fmt = (n) => `${currency} ${(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 })}`;

  const earnings = [
    ["Basic Salary", fmt(payroll.basicSalary)],
    ["Allowance", fmt(payroll.allowance)]
  ];
  const totalEarnings = (payroll.basicSalary || 0) + (payroll.allowance || 0);

  const deductions = [
    ["Tax Deduction", fmt(payroll.taxDeduction)],
    ["Leave Deduction", fmt(payroll.leaveDeduction)],
    ["Advance Deduction", fmt(payroll.advanceDeduction)],
    ["Extra Off Deduction", fmt(payroll.extraOffDeduction)],
    ["EOBI", fmt(payroll.eobiDeduction)],
    ["Provident Fund", fmt(payroll.pfDeduction)]
  ].filter(([, v]) => v !== fmt(0));

  const totalDeductions = payroll.deductions || 0;

  // Two-column layout
  const colW = 247;
  let rowY = doc.y;

  doc.font("Helvetica-Bold").fontSize(11)
    .text("EARNINGS", 50, rowY)
    .text("DEDUCTIONS", 305, rowY);
  rowY += 20;

  const maxRows = Math.max(earnings.length, deductions.length);
  for (let i = 0; i < maxRows; i++) {
    const [ek, ev] = earnings[i] || [];
    const [dk, dv] = deductions[i] || [];
    if (ek) {
      doc.font("Helvetica").fontSize(10).text(ek, 50, rowY).text(ev, 180, rowY, { align: "right", width: colW - 30 });
    }
    if (dk) {
      doc.font("Helvetica").fontSize(10).text(dk, 305, rowY).text(dv, 435, rowY, { align: "right", width: colW - 30 });
    }
    rowY += 16;
  }

  rowY += 5;
  doc.moveTo(50, rowY).lineTo(545, rowY).stroke();
  rowY += 5;

  doc.font("Helvetica-Bold").fontSize(10)
    .text("Total Earnings:", 50, rowY).text(fmt(totalEarnings), 180, rowY, { align: "right", width: colW - 30 })
    .text("Total Deductions:", 305, rowY).text(fmt(totalDeductions), 435, rowY, { align: "right", width: colW - 30 });

  rowY += 30;
  doc.moveTo(50, rowY).lineTo(545, rowY).stroke();
  rowY += 10;
  doc.font("Helvetica-Bold").fontSize(13)
    .text("NET SALARY:", 50, rowY)
    .text(fmt(payroll.netSalary), 50, rowY, { align: "right" });

  rowY += 25;
  doc.fontSize(9).font("Helvetica").fillColor("grey")
    .text("Working Days: " + (payroll.workingDays || 0), 50, rowY)
    .text("Present Days: " + (payroll.presentDays || 0), 180, rowY)
    .text("Status: " + payroll.status, 310, rowY);

  rowY += 30;
  doc.moveTo(50, rowY).lineTo(545, rowY).stroke();
  doc.moveDown().fontSize(8).fillColor("grey")
    .text("This is a computer-generated document and does not require a signature.", { align: "center" });

  doc.end();
});

// ── Payroll Excel Export ──────────────────────────────────────────────────────

exports.exportPayrollExcel = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) { res.status(400); throw new Error("month and year are required"); }

  const payrolls = await Payroll.find({ month: Number(month), year: Number(year) })
    .populate("employee", "name employeeId department designation bankName bankAccountNumber");

  if (payrolls.length === 0) { res.status(404); throw new Error("No payroll data found for this period"); }

  const settings = await Settings.findOne();
  const currency = settings?.currency?.code || "PKR";

  const monthName = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleString("en-US", { month: "long" });

  const rows = payrolls.map((p) => ({
    "Employee ID": p.employee?.employeeId || "",
    "Employee Name": p.employee?.name || "",
    "Department": p.employee?.department || "",
    "Designation": p.employee?.designation || "",
    "Bank": p.employee?.bankName || "",
    "Account No": p.employee?.bankAccountNumber || "",
    "Basic Salary": p.basicSalary || 0,
    "Allowance": p.allowance || 0,
    "Working Days": p.workingDays || 0,
    "Present Days": p.presentDays || 0,
    "Extra Off Days": p.extraOffDays || 0,
    "Tax Deduction": p.deductions || 0,
    "Leave Deduction": p.leaveDeduction || 0,
    "Advance Deduction": p.advanceDeduction || 0,
    "Extra Off Deduction": p.extraOffDeduction || 0,
    "EOBI": p.eobiDeduction || 0,
    "Provident Fund": p.pfDeduction || 0,
    [`Net Salary (${currency})`]: p.netSalary || 0,
    "Status": p.status
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 14 }, { wch: 24 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 18 },
    { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 13 }, { wch: 14 },
    { wch: 14 }, { wch: 16 }, { wch: 17 }, { wch: 18 }, { wch: 8 }, { wch: 14 },
    { wch: 18 }, { wch: 10 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, `${monthName} ${year}`);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="payroll-${monthName}-${year}.xlsx"`);
  res.send(buf);
});

// ── Attendance Excel Export ───────────────────────────────────────────────────

exports.exportAttendanceExcel = asyncHandler(async (req, res) => {
  const { month, year, employeeId } = req.query;
  if (!month || !year) { res.status(400); throw new Error("month and year are required"); }

  const m = Number(month);
  const y = Number(year);
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 0, 23, 59, 59);

  const query = { date: { $gte: from, $lte: to } };
  if (employeeId) {
    const emp = await Employee.findOne({ employeeId });
    if (emp) query.employee = emp._id;
  }

  const records = await Attendance.find(query)
    .populate("employee", "name employeeId department")
    .sort({ date: 1 });

  const rows = records.map((r) => ({
    "Employee ID": r.employee?.employeeId || "",
    "Employee Name": r.employee?.name || "",
    "Department": r.employee?.department || "",
    "Date": r.date ? new Date(r.date).toLocaleDateString() : "",
    "Punch In": r.punchIn || "",
    "Punch Out": r.punchOut || "",
    "Working Hours": r.workingHours != null ? r.workingHours.toFixed(2) : "",
    "Status": r.status || "",
    "Late (min)": r.lateMinutes || 0,
    "Overtime (min)": r.overtimeMinutes || 0
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 14 }, { wch: 24 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];

  const monthName = from.toLocaleString("en-US", { month: "long" });
  XLSX.utils.book_append_sheet(wb, ws, `Attendance ${monthName} ${year}`);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="attendance-${monthName}-${year}.xlsx"`);
  res.send(buf);
});
