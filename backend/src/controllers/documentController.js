const asyncHandler = require("express-async-handler");
const Document = require("../models/Document");
const Employee = require("../models/Employee");
const { logAudit } = require("../services/auditService");
const path = require("path");
const fs = require("fs");

exports.getDocuments = asyncHandler(async (req, res) => {
  const { employee, type, page = 1, limit = 20 } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (type) query.type = type;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    Document.find(query)
      .populate("employee", "name employeeId department")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip).limit(parseInt(limit)),
    Document.countDocuments(query)
  ]);
  res.json({ documents: docs, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getDocumentById = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id)
    .populate("employee", "name employeeId")
    .populate("uploadedBy", "name");
  if (!doc) { res.status(404); throw new Error("Document not found"); }
  res.json(doc);
});

exports.uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error("File is required"); }

  const { employee, title, type, expiryDate, notes, isSharedWithEmployee } = req.body;

  if (employee) {
    const emp = await Employee.findById(employee);
    if (!emp) { res.status(404); throw new Error("Employee not found"); }
  }

  const fileUrl = `/uploads/documents/${req.file.filename}`;

  const doc = await Document.create({
    employee: employee || undefined,
    title: (title || req.file.originalname).trim(),
    type,
    fileUrl,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    notes,
    isSharedWithEmployee: isSharedWithEmployee === "true",
    uploadedBy: req.user._id
  });

  logAudit(req, { module: "Document", action: "Create", recordId: doc._id, recordName: doc.title, description: `${req.user?.name} uploaded document: ${doc.title}`, newValues: { title: doc.title, type: doc.type, employee } });

  res.status(201).json(doc);
});

exports.updateDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) { res.status(404); throw new Error("Document not found"); }

  const { title, type, expiryDate, notes, isSharedWithEmployee } = req.body;
  if (title !== undefined) doc.title = title.trim();
  if (type !== undefined) doc.type = type;
  if (expiryDate !== undefined) doc.expiryDate = expiryDate ? new Date(expiryDate) : null;
  if (notes !== undefined) doc.notes = notes;
  if (isSharedWithEmployee !== undefined) doc.isSharedWithEmployee = Boolean(isSharedWithEmployee);

  await doc.save();
  res.json(doc);
});

exports.deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) { res.status(404); throw new Error("Document not found"); }

  // Remove file from disk
  const filePath = path.join(__dirname, "../../uploads/documents", path.basename(doc.fileUrl || ""));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  logAudit(req, { module: "Document", action: "Delete", recordId: doc._id, recordName: doc.title, description: `${req.user?.name} deleted document: ${doc.title}` });

  await Document.findByIdAndDelete(req.params.id);
  res.json({ message: "Document deleted successfully" });
});
