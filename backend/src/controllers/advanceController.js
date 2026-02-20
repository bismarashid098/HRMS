const asyncHandler = require("express-async-handler");
const Advance = require("../models/Advance");
const Employee = require("../models/Employee");

// @desc    Request a salary advance
// @route   POST /api/advances
// @access  Private (Employee/HR)
exports.requestAdvance = asyncHandler(async (req, res) => {
  const { employeeId, amount, reason, date } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const advanceDate = date ? new Date(date) : new Date();
  const month = advanceDate.getMonth() + 1;
  const year = advanceDate.getFullYear();

  const advance = await Advance.create({
    employee: employeeId,
    amount,
    reason,
    date: advanceDate,
    month,
    year
  });

  res.status(201).json(advance);
});

// @desc    Get all advances (with filters)
// @route   GET /api/advances
// @access  Private
exports.getAdvances = asyncHandler(async (req, res) => {
  const { month, year, employeeId } = req.query;
  const query = {};

  if (month) query.month = month;
  if (year) query.year = year;
  if (employeeId) query.employee = employeeId;

  if (req.user.role === "Employee") {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      res.status(404);
      throw new Error("Employee profile not found");
    }
    query.employee = employee._id;
  }

  const advances = await Advance.find(query)
    .populate({
      path: "employee",
      populate: { path: "user", select: "name" }
    })
    .sort({ date: -1 });

  res.json(advances);
});

// @desc    Update advance status (Approve/Reject)
// @route   PUT /api/advances/:id
// @access  Private (HR/Admin)
exports.updateAdvanceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const advance = await Advance.findById(req.params.id);

  if (!advance) {
    res.status(404);
    throw new Error("Advance request not found");
  }

  advance.status = status;
  await advance.save();

  res.json(advance);
});
