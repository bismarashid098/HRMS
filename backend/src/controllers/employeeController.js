const Employee = require("../models/Employee");
const asyncHandler = require("express-async-handler");
const { logAudit } = require("../services/auditService");

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
    religion,
    monthlyOffDays
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
    employmentStatus,
    monthlyOffDays: monthlyOffDays != null ? Number(monthlyOffDays) : 3
  });

  logAudit(req, {
    module: "Employee",
    action: "Create",
    recordId: employee._id,
    recordName: employee.name,
    description: `${req.user?.name} created employee ${employee.name} (${employee.employeeId})`,
    newValues: { name, department, salary, designation, email, phone, employmentStatus },
  });

  res.status(201).json(employee);
});

exports.getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });

  if (req.user && req.user.role === "Manager") {
    const sanitized = employees.map((e) => sanitizeForManager(e));
    res.json(sanitized);
    return;
  }

  res.json(employees);
});

exports.getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

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
    religion,
    monthlyOffDays
  } = req.body;

  const oldValues = {
    name: employee.name,
    department: employee.department,
    salary: employee.salary,
    email: employee.email,
    designation: employee.designation,
    phone: employee.phone,
    employmentStatus: employee.employmentStatus,
    monthlyOffDays: employee.monthlyOffDays,
  };

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
  if (monthlyOffDays != null) {
    employee.monthlyOffDays = Number(monthlyOffDays);
  }

  await employee.save();

  logAudit(req, {
    module: "Employee",
    action: "Update",
    recordId: employee._id,
    recordName: employee.name,
    description: `${req.user?.name} updated employee ${employee.name}`,
    oldValues,
    newValues: {
      name: employee.name,
      department: employee.department,
      salary: employee.salary,
      email: employee.email,
      designation: employee.designation,
      phone: employee.phone,
      employmentStatus: employee.employmentStatus,
      monthlyOffDays: employee.monthlyOffDays,
    },
  });

  res.json(employee);
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  logAudit(req, {
    module: "Employee",
    action: "Delete",
    recordId: employee._id,
    recordName: employee.name,
    description: `${req.user?.name} deleted employee ${employee.name} (${employee.employeeId})`,
    oldValues: { name: employee.name, department: employee.department, designation: employee.designation },
  });

  employee.isDeleted = true;
  await employee.save();

  res.json({ message: "Employee deleted successfully" });
});
