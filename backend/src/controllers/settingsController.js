const asyncHandler = require("express-async-handler");
const Settings = require("../models/Settings");
const { logAudit } = require("../services/auditService");

exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json(settings);
});

exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  const oldValues = settings ? settings.toObject() : {};
  if (!settings) settings = await Settings.create({});

  const body = req.body;

  // Company settings
  if (body.company && typeof body.company === "object") {
    const allowed = ["name", "address", "email", "phone"];
    allowed.forEach((f) => { if (body.company[f] !== undefined) settings.company[f] = String(body.company[f]).slice(0, 500); });
  }

  // Attendance settings
  if (body.attendance && typeof body.attendance === "object") {
    if (body.attendance.workingHours && typeof body.attendance.workingHours === "object") {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (body.attendance.workingHours.start !== undefined) {
        if (!timeRegex.test(body.attendance.workingHours.start)) { res.status(400); throw new Error("workingHours.start must be HH:MM"); }
        settings.attendance.workingHours.start = body.attendance.workingHours.start;
      }
      if (body.attendance.workingHours.end !== undefined) {
        if (!timeRegex.test(body.attendance.workingHours.end)) { res.status(400); throw new Error("workingHours.end must be HH:MM"); }
        settings.attendance.workingHours.end = body.attendance.workingHours.end;
      }
    }
    if (body.attendance.lateAfterMinutes !== undefined) {
      const v = Number(body.attendance.lateAfterMinutes);
      if (isNaN(v) || v < 0) { res.status(400); throw new Error("lateAfterMinutes must be >= 0"); }
      settings.attendance.lateAfterMinutes = v;
    }
    if (body.attendance.halfDayAfterMinutes !== undefined) {
      const v = Number(body.attendance.halfDayAfterMinutes);
      if (isNaN(v) || v < 0) { res.status(400); throw new Error("halfDayAfterMinutes must be >= 0"); }
      settings.attendance.halfDayAfterMinutes = v;
    }
    if (body.attendance.policy && typeof body.attendance.policy === "object") {
      const p = body.attendance.policy;
      if (p.gracePeriod !== undefined) settings.attendance.policy.gracePeriod = Number(p.gracePeriod);
      if (p.deductionType !== undefined) {
        const validTypes = ["None", "Fixed", "Percentage", "PerMinute"];
        if (!validTypes.includes(p.deductionType)) { res.status(400); throw new Error("Invalid deductionType"); }
        settings.attendance.policy.deductionType = p.deductionType;
      }
      if (p.deductionValue !== undefined) settings.attendance.policy.deductionValue = Number(p.deductionValue);
    }
  }

  // Payroll settings
  if (body.payroll && typeof body.payroll === "object") {
    if (body.payroll.taxPercentage !== undefined) {
      const v = Number(body.payroll.taxPercentage);
      if (isNaN(v) || v < 0 || v > 100) { res.status(400); throw new Error("taxPercentage must be 0-100"); }
      settings.payroll.taxPercentage = v;
    }
    if (body.payroll.overtimeRatePerHour !== undefined) settings.payroll.overtimeRatePerHour = Math.max(0, Number(body.payroll.overtimeRatePerHour));
    if (body.payroll.monthlyOffDays !== undefined) {
      const v = Number(body.payroll.monthlyOffDays);
      if (isNaN(v) || v < 0 || v > 31) { res.status(400); throw new Error("monthlyOffDays must be 0-31"); }
      settings.payroll.monthlyOffDays = v;
    }
  }

  // Currency settings
  if (body.currency && typeof body.currency === "object") {
    if (body.currency.code !== undefined) settings.currency.code = String(body.currency.code).slice(0, 5);
    if (body.currency.symbol !== undefined) settings.currency.symbol = String(body.currency.symbol).slice(0, 5);
  }

  // Advances settings
  if (body.advances && typeof body.advances === "object") {
    if (body.advances.limitType !== undefined) {
      if (!["PERCENTAGE", "FIXED"].includes(body.advances.limitType)) { res.status(400); throw new Error("limitType must be PERCENTAGE or FIXED"); }
      settings.advances.limitType = body.advances.limitType;
    }
    if (body.advances.limitValue !== undefined) settings.advances.limitValue = Math.max(0, Number(body.advances.limitValue));
  }

  settings.markModified("company");
  settings.markModified("attendance");
  settings.markModified("payroll");
  settings.markModified("currency");
  settings.markModified("advances");
  await settings.save();

  logAudit(req, {
    module: "Settings",
    action: "Update",
    recordName: "System Settings",
    description: `${req.user?.name} updated system settings`,
    oldValues,
    newValues: settings.toObject()
  });

  res.json({ message: "Settings updated successfully", settings });
});
