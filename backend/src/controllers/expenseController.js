const asyncHandler = require("express-async-handler");
const Expense = require("../models/Expense");
const Employee = require("../models/Employee");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getExpenses = asyncHandler(async (req, res) => {
  const { employee, status, category, fromDate, toDate, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (status) query.status = status;
  if (category) query.category = category;
  if (fromDate || toDate) {
    query.date = {};
    if (fromDate) query.date.$gte = new Date(fromDate);
    if (toDate) { const e = new Date(toDate); e.setHours(23, 59, 59, 999); query.date.$lte = e; }
  }
  if (search) query.title = new RegExp(escapeRegex(search), "i");

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .populate("employee", "name employeeId department")
      .populate("approvedBy", "name")
      .sort({ date: -1 })
      .skip(skip).limit(parseInt(limit)),
    Expense.countDocuments(query)
  ]);
  res.json({ expenses, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getExpenseById = asyncHandler(async (req, res) => {
  const e = await Expense.findById(req.params.id)
    .populate("employee", "name employeeId department designation")
    .populate("approvedBy", "name");
  if (!e) { res.status(404); throw new Error("Expense not found"); }
  res.json(e);
});

exports.createExpense = asyncHandler(async (req, res) => {
  const { employee, title, category, amount, currency, date, description } = req.body;
  if (!employee) { res.status(400); throw new Error("Employee is required"); }
  if (!title) { res.status(400); throw new Error("Title is required"); }
  if (!amount || Number(amount) <= 0) { res.status(400); throw new Error("Amount must be greater than 0"); }
  if (!date) { res.status(400); throw new Error("Date is required"); }

  const emp = await Employee.findById(employee);
  if (!emp) { res.status(404); throw new Error("Employee not found"); }

  const expense = await Expense.create({
    employee, title: title.trim(), category, amount: Number(amount),
    currency: currency || "PKR",
    date: new Date(date), description,
    submittedBy: req.user._id
  });

  logAudit(req, { module: "Expense", action: "Create", recordId: expense._id, recordName: expense.title, description: `${req.user?.name} submitted expense: ${expense.title} for ${emp.name}`, newValues: expense.toObject() });

  res.status(201).json(expense);
});

exports.updateExpenseStatus = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) { res.status(404); throw new Error("Expense not found"); }
  if (expense.status === "Paid") { res.status(400); throw new Error("Cannot modify a paid expense"); }

  const { status, rejectionReason } = req.body;
  const validStatuses = ["Approved", "Rejected", "Paid"];
  if (!validStatuses.includes(status)) { res.status(400); throw new Error(`Status must be one of: ${validStatuses.join(", ")}`); }

  if (status === "Rejected" && !rejectionReason) { res.status(400); throw new Error("Rejection reason is required"); }

  const old = expense.toObject();
  expense.status = status;
  if (status === "Approved" || status === "Rejected") {
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
  }
  if (status === "Rejected") expense.rejectionReason = rejectionReason;
  if (status === "Paid") expense.paidAt = new Date();

  await expense.save();
  logAudit(req, { module: "Expense", action: status === "Approved" ? "Approve" : "Update", recordId: expense._id, recordName: expense.title, description: `${req.user?.name} ${status.toLowerCase()} expense: ${expense.title}`, oldValues: old, newValues: expense.toObject() });

  res.json(expense);
});

exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) { res.status(404); throw new Error("Expense not found"); }
  if (expense.status === "Paid") { res.status(400); throw new Error("Cannot delete a paid expense"); }

  logAudit(req, { module: "Expense", action: "Delete", recordId: expense._id, recordName: expense.title, description: `${req.user?.name} deleted expense: ${expense.title}` });

  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Expense deleted successfully" });
});
