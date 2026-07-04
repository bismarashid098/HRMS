const express = require("express");
const { downloadPayslip, exportPayrollExcel, exportAttendanceExcel } = require("../controllers/exportController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect, authorize("Admin"));

router.get("/payslip/:id", downloadPayslip);
router.get("/payroll", exportPayrollExcel);
router.get("/attendance", exportAttendanceExcel);

module.exports = router;
