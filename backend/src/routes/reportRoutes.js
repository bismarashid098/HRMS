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

// Admin & Manager can access attendance and leave reports
router.get("/attendance", authorize("Admin", "Manager"), attendanceReport);
router.get("/leaves", authorize("Admin", "Manager"), leaveReport);

// Admin only for payroll reports
router.get("/payroll", authorize("Admin"), payrollReport);

module.exports = router;
