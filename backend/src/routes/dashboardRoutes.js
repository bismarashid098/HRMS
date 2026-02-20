const express = require("express");
const { 
    getDashboardSummary, 
    getAttendanceChartData, 
    getLeaveStats, 
    getPayrollStats 
} = require("../controllers/dashboardController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);
router.get("/attendance-chart", protect, getAttendanceChartData);
router.get("/leave-stats", protect, getLeaveStats);
router.get("/payroll-stats", protect, getPayrollStats);

module.exports = router;
