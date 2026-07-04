const Employee = require("../models/Employee");
const asyncHandler = require("express-async-handler");
const { logAudit } = require("../services/auditService");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sanitizeForManager = (employee) => {
  if (!employee) return employee;
  const doc = employee.toObject ? employee.toObject() : { ...employee };
  delete doc.salary;
  delete doc.bankAccountNumber;
  delete doc.eobi;
  delete doc.eobiAmount;
  delete doc.providentFund;
  delete doc.providentFundPercentage;
  return doc;
};

exports.createEmployee = asyncHandler(async (req, res) => {
  const {
    name, department, salary, biometricId, leaveBalance,
    email, designation, phone, address, joiningDate,
    employmentStatus, gender, dutyStartTime, religion,
    monthlyOffDays, cnic, passport, emergencyContact, branch,
    shift, probationEndDate, confirmationDate, eobi, eobiAmount,
    providentFund, providentFundPercentage, bankName, bankAccountNumber
  } = req.body;

  if (!name || !department) {
    return res.status(400).json({ message: "Name and department are required" });
  }
  if (salary == null || Number(salary) < 0) {
    return res.status(400).json({ message: "Valid salary is required (must be >= 0)" });
  }

  let finalBiometricId = biometricId || `EMP${Date.now()}`;
  let finalEmployeeId = `EMP-${Date.now()}`;

  const employee = await Employee.create({
    name, department, salary: Number(salary),
    employeeId: finalEmployeeId,
    biometricId: finalBiometricId,
    leaveBalance: leaveBalance != null ? Number(leaveBalance) : 0,
    email, designation, phone, gender, dutyStartTime, religion,
    address, joiningDate, employmentStatus,
    monthlyOffDays: monthlyOffDays != null ? Number(monthlyOffDays) : 3,
    cnic, passport,
    emergencyContact: emergencyContact || undefined,
    branch, shift,
    probationEndDate: probationEndDate || undefined,
    confirmationDate: confirmationDate || undefined,
    eobi: eobi === true || eobi === "true",
    eobiAmount: Number(eobiAmount || 0),
    providentFund: providentFund === true || providentFund === "true",
    providentFundPercentage: Number(providentFundPercentage || 0),
    bankName, bankAccountNumber
  });

  logAudit(req, {
    module: "Employee",
    action: "Create",
    recordId: employee._id,
    recordName: employee.name,
    description: `${req.user?.name} created employee ${employee.name} (${employee.employeeId})`,
    newValues: { name, department, salary, designation, email, phone, employmentStatus }
  });

  res.status(201).json(employee);
});

exports.getEmployees = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, department } = req.query;
  const query = { isDeleted: { $ne: true } };

  if (status) query.employmentStatus = status;
  if (department) query.department = new RegExp(escapeRegex(department), "i");
  if (search) {
    const re = new RegExp(escapeRegex(search), "i");
    query.$or = [{ name: re }, { employeeId: re }, { email: re }, { department: re }, { designation: re }, { cnic: re }];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Employee.countDocuments(query);
  const employees = await Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

  if (req.user && req.user.role === "Manager") {
    return res.json({ employees: employees.map((e) => sanitizeForManager(e)), total, page: parseInt(page), limit: parseInt(limit) });
  }
  res.json({ employees, total, page: parseInt(page), limit: parseInt(limit) });
});

exports.getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!employee) { res.status(404); throw new Error("Employee not found"); }

  if (req.user && req.user.role === "Manager") {
    return res.json(sanitizeForManager(employee));
  }
  res.json(employee);
});

exports.getDeletedEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ isDeleted: true }).sort({ updatedAt: -1 });
  res.json(employees);
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) { res.status(404); throw new Error("Employee not found"); }

  const {
    name, department, salary, biometricId, leaveBalance, email,
    designation, phone, address, joiningDate, employmentStatus,
    gender, dutyStartTime, religion, monthlyOffDays, cnic, passport,
    emergencyContact, branch, shift, probationEndDate, confirmationDate,
    resignationDate, terminationDate, terminationReason, rehireDate,
    eobi, eobiAmount, providentFund, providentFundPercentage,
    bankName, bankAccountNumber
  } = req.body;

  const oldValues = {
    name: employee.name, department: employee.department, salary: employee.salary,
    email: employee.email, designation: employee.designation, phone: employee.phone,
    employmentStatus: employee.employmentStatus, monthlyOffDays: employee.monthlyOffDays
  };

  if (biometricId && biometricId !== employee.biometricId) {
    const exists = await Employee.findOne({ biometricId, _id: { $ne: employee._id } });
    if (exists) { res.status(400); throw new Error("Biometric ID already in use"); }
    employee.biometricId = biometricId;
  }

  if (salary != null && Number(salary) < 0) { res.status(400); throw new Error("Salary must be >= 0"); }

  const fields = { name, department, salary, leaveBalance, email, designation, phone, gender, dutyStartTime, religion, address, joiningDate, employmentStatus, monthlyOffDays, cnic, passport, branch, shift, probationEndDate, confirmationDate, resignationDate, terminationDate, terminationReason, rehireDate, bankName, bankAccountNumber };
  Object.entries(fields).forEach(([k, v]) => { if (v != null) employee[k] = typeof v === "string" || typeof v === "boolean" ? v : Number(v) || v; });

  if (emergencyContact) employee.emergencyContact = emergencyContact;
  if (eobi !== undefined) employee.eobi = eobi === true || eobi === "true";
  if (eobiAmount !== undefined) employee.eobiAmount = Number(eobiAmount);
  if (providentFund !== undefined) employee.providentFund = providentFund === true || providentFund === "true";
  if (providentFundPercentage !== undefined) employee.providentFundPercentage = Number(providentFundPercentage);

  await employee.save();

  logAudit(req, {
    module: "Employee",
    action: "Update",
    recordId: employee._id,
    recordName: employee.name,
    description: `${req.user?.name} updated employee ${employee.name}`,
    oldValues,
    newValues: { name: employee.name, department: employee.department, salary: employee.salary, email: employee.email, designation: employee.designation, employmentStatus: employee.employmentStatus }
  });

  res.json(employee);
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) { res.status(404); throw new Error("Employee not found"); }

  logAudit(req, {
    module: "Employee",
    action: "Delete",
    recordId: employee._id,
    recordName: employee.name,
    description: `${req.user?.name} deleted employee ${employee.name} (${employee.employeeId})`,
    oldValues: { name: employee.name, department: employee.department }
  });

  employee.isDeleted = true;
  await employee.save();
  res.json({ message: "Employee deleted successfully" });
});

exports.restoreEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) { res.status(404); throw new Error("Employee not found"); }
  if (!employee.isDeleted) return res.status(400).json({ message: "Employee is not deleted" });

  employee.isDeleted = false;
  employee.employmentStatus = "Active";
  await employee.save();

  logAudit(req, {
    module: "Employee",
    action: "Update",
    recordId: employee._id,
    recordName: employee.name,
    description: `${req.user?.name} restored employee ${employee.name}`
  });

  res.json({ message: "Employee restored successfully", employee });
});
