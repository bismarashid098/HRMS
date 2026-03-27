const express = require("express");
const {
  punchIn,
  punchOut,
  getMonthlyAttendance,
  getDailyAttendanceList,
  getAttendanceRange,
  requestCorrection,
  approveCorrection,
  manualMark
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

// Admin only - write operations
router.post("/punch-in", authorize("Admin"), punchIn);
router.post("/punch-out", authorize("Admin"), punchOut);
router.post("/manual", authorize("Admin"), manualMark);
router.put("/correction/:id", authorize("Admin"), approveCorrection);

// Admin & Manager - read operations
router.get("/", authorize("Admin", "Manager"), getMonthlyAttendance);
router.get("/daily", authorize("Admin", "Manager"), getDailyAttendanceList);
router.get("/range", authorize("Admin", "Manager"), getAttendanceRange);

// Correction request (no role in original, keep open for any authenticated)
router.post("/correction", protect, requestCorrection);

module.exports = router;
