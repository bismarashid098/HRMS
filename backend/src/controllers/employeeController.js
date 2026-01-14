const Employee = require("../models/Employee");

/**
 * @desc    Add employee
 * @route   POST /api/employees
 * @access  Admin, HR
 */
exports.createEmployee = async (req, res) => {
  const employee = await Employee.create(req.body);
  res.status(201).json(employee);
};

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Admin, HR
 */
exports.getEmployees = async (req, res) => {
  const employees = await Employee.find({ isDeleted: false })
    .populate("user", "name email role");

  res.json(employees);
};

/**
 * @desc    Get single employee
 * @route   GET /api/employees/:id
 * @access  Admin, HR
 */
exports.getEmployeeById = async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate("user", "name email");

  if (!employee || employee.isDeleted) {
    return res.status(404).json({ message: "Employee not found" });
  }

  res.json(employee);
};

/**
 * @desc    Update employee
 * @route   PUT /api/employees/:id
 * @access  Admin, HR
 */
exports.updateEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee || employee.isDeleted) {
    return res.status(404).json({ message: "Employee not found" });
  }

  Object.assign(employee, req.body);
  await employee.save();

  res.json(employee);
};

/**
 * @desc    Soft delete employee
 * @route   DELETE /api/employees/:id
 * @access  Admin
 */
exports.deleteEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  employee.isDeleted = true;
  employee.employmentStatus = "Terminated";
  await employee.save();

  res.json({ message: "Employee deleted successfully" });
};
