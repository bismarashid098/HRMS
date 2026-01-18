const express = require("express");
const {
  attendanceReport,
  leaveReport,
  payrollReport
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("Admin", "HR"));

// 
router.get("/attendance", attendanceReport);
router.get("/leaves", leaveReport);
router.get("/payroll", payrollReport);

module.exports = router;
