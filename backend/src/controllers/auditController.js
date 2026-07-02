const asyncHandler = require("express-async-handler");
const xlsx = require("xlsx");
const AuditLog = require("../models/AuditLog");

const buildQuery = (q) => {
  const query = {};
  const { module, action, role, userId, search, from, to } = q;
  if (module) query.module = module;
  if (action) query.action = action;
  if (role)   query.userRole = role;
  if (userId) query.user = userId;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) {
      const t = new Date(to);
      t.setHours(23, 59, 59, 999);
      query.createdAt.$lte = t;
    }
  }
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { recordName:  { $regex: search, $options: "i" } },
      { userName:    { $regex: search, $options: "i" } },
    ];
  }
  return query;
};

// GET /api/audit-logs
exports.getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25 } = req.query;
  const query = buildQuery(req.query);
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    AuditLog.countDocuments(query),
  ]);
  res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// GET /api/audit-logs/export
exports.exportAuditLogs = asyncHandler(async (req, res) => {
  const { format = "xlsx" } = req.query;
  const query = buildQuery(req.query);
  const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(10000).lean();

  const rows = logs.map((l) => ({
    "Date & Time":    new Date(l.createdAt).toLocaleString("en-PK"),
    "User":           l.userName || "",
    "Role":           l.userRole || "",
    "Module":         l.module || "",
    "Action":         l.action || "",
    "Record":         l.recordName || "",
    "Description":    l.description || "",
    "IP Address":     l.ip || "",
    "Browser":        l.browser || "",
    "OS":             l.os || "",
    "Device":         l.device || "",
    "Changed Fields": (l.changedFields || []).join(", "),
  }));

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 20 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 14 },
    { wch: 20 }, { wch: 55 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
    { wch: 8  }, { wch: 25 },
  ];
  xlsx.utils.book_append_sheet(wb, ws, "Audit Logs");

  if (format === "csv") {
    const csv = xlsx.utils.sheet_to_csv(ws);
    res.set({ "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="audit_logs.csv"' });
    return res.send(csv);
  }

  const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  res.set({
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": 'attachment; filename="audit_logs.xlsx"',
  });
  res.send(buf);
});

// GET /api/audit-logs/meta — distinct values for filter dropdowns
exports.getAuditMeta = asyncHandler(async (req, res) => {
  const [modules, actions, roles] = await Promise.all([
    AuditLog.distinct("module"),
    AuditLog.distinct("action"),
    AuditLog.distinct("userRole"),
  ]);
  res.json({ modules, actions, roles });
});
