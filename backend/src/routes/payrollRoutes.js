const express = require("express");
const {
  generatePayroll,
  approvePayroll,
  deletePayroll,
  getPayrollHistory,
  getAllPayrolls,
  getPayrollOverview,
  getPayrollBreakdown,
  getPayrollById
} = require("../controllers/payrollController");

const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(protect);

router.post("/generate", authorizePermission("payroll"), generatePayroll);
router.get("/overview", authorizePermission("payroll"), getPayrollOverview);
router.get("/employee/:employeeId", authorizePermission("payroll"), getPayrollHistory);
router.get("/", authorizePermission("payroll"), getAllPayrolls);
router.get("/:id/breakdown", authorizePermission("payroll"), getPayrollBreakdown);
router.get("/:id", authorizePermission("payroll"), getPayrollById);
router.put("/:id/approve", authorizePermission("payroll"), approvePayroll);
router.delete("/:id", authorizePermission("payroll"), deletePayroll);

module.exports = router;
