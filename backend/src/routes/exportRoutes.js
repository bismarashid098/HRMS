const express = require("express");
const { downloadPayslip, exportPayrollExcel, exportAttendanceExcel } = require("../controllers/exportController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
router.use(protect, authorizePermission("payroll"));

router.get("/payslip/:id", downloadPayslip);
router.get("/payroll", exportPayrollExcel);
router.get("/attendance", exportAttendanceExcel);

module.exports = router;
