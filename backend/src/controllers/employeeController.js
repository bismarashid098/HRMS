const Employee = require("../models/Employee");
const asyncHandler = require("express-async-handler");

const sanitizeForManager = (employee) => {
  if (!employee) {
    return employee;
  }
  const doc = employee.toObject ? employee.toObject() : employee;
  delete doc.salary;
  return doc;
};

exports.createEmployee = asyncHandler(async (req, res) => {
  const { name, department, salary, biometricId, leaveBalance } = req.body;

  if (!name || !department || salary == null || !biometricId) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const exists = await Employee.findOne({ biometricId });
  if (exists) {
    res.status(400);
    throw new Error("Employee with this biometricId already exists");
  }

  const employee = await Employee.create({
    name,
    department,
    salary,
    biometricId,
    leaveBalance
  });

  res.status(201).json(employee);
});

exports.getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });

  if (req.user && req.user.role === "Manager") {
    const sanitized = employees.map((e) => sanitizeForManager(e));
    res.json(sanitized);
    return;
  }

  res.json(employees);
});

exports.getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  if (req.user && req.user.role === "Manager") {
    res.json(sanitizeForManager(employee));
    return;
  }

  res.json(employee);
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const { name, department, salary, biometricId, leaveBalance } = req.body;

  if (biometricId && biometricId !== employee.biometricId) {
    const exists = await Employee.findOne({ biometricId });
    if (exists) {
      res.status(400);
      throw new Error("Employee with this biometricId already exists");
    }
    employee.biometricId = biometricId;
  }

  if (name != null) {
    employee.name = name;
  }
  if (department != null) {
    employee.department = department;
  }
  if (salary != null) {
    employee.salary = salary;
  }
  if (leaveBalance != null) {
    employee.leaveBalance = leaveBalance;
  }

  await employee.save();

  res.json(employee);
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  await employee.deleteOne();

  res.json({ message: "Employee deleted successfully" });
});
