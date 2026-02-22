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
  const {
    name,
    department,
    salary,
    biometricId,
    leaveBalance,
    email,
    designation,
    phone,
    address,
    joiningDate,
    employmentStatus,
    gender,
    dutyStartTime,
    religion
  } = req.body;

  let finalBiometricId = biometricId;
  let employeeId = `EMP-${Date.now()}`;

  if (!finalBiometricId) {
    finalBiometricId = `EMP${Date.now()}`;
  }

  const exists = await Employee.findOne({ biometricId: finalBiometricId });
  if (exists) {
    finalBiometricId = `EMP${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  const existingEmployeeId = await Employee.findOne({ employeeId });
  if (existingEmployeeId) {
    employeeId = `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  const employee = await Employee.create({
    name,
    department,
    salary,
    employeeId,
    biometricId: finalBiometricId,
    leaveBalance: leaveBalance != null ? leaveBalance : 0,
    email,
    designation,
    phone,
    gender,
    dutyStartTime,
    religion,
    address,
    joiningDate,
    employmentStatus
  });

  res.status(201).json(employee);
});

exports.getEmployees = asyncHandler(async (req, res) => {
  await Employee.deleteMany({
    name: /^Demo Employee /,
    biometricId: /^AUTO/
  });

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

  const {
    name,
    department,
    salary,
    biometricId,
    leaveBalance,
    email,
    designation,
    phone,
    address,
    joiningDate,
    employmentStatus,
    gender,
    dutyStartTime,
    religion
  } = req.body;

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
  if (email != null) {
    employee.email = email;
  }
  if (designation != null) {
    employee.designation = designation;
  }
  if (phone != null) {
    employee.phone = phone;
  }
  if (gender != null) {
    employee.gender = gender;
  }
  if (dutyStartTime != null) {
    employee.dutyStartTime = dutyStartTime;
  }
  if (religion != null) {
    employee.religion = religion;
  }
  if (address != null) {
    employee.address = address;
  }
  if (joiningDate != null) {
    employee.joiningDate = joiningDate;
  }
  if (employmentStatus != null) {
    employee.employmentStatus = employmentStatus;
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
