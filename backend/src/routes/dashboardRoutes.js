const express = require("express");
const {
    getDashboardSummary,
    getAttendanceChartData,
    getLeaveStats,
    getPayrollStats
} = require("../controllers/dashboardController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);
router.get("/attendance-chart", protect, getAttendanceChartData);
router.get("/leave-stats", protect, getLeaveStats);
router.get("/payroll-stats", protect, authorize("Admin"), getPayrollStats);

module.exports = router;
