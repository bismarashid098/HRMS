const express = require("express");
const {
  punchIn,
  punchOut,
  getMonthlyAttendance,
  getDailyAttendance,
  getAttendanceRange,
  getAttendanceReport,
  requestCorrection,
  approveCorrection,
  manualMark,
  bulkManualMark,
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

// ── Admin write operations ─────────────────────────────────────
router.post("/punch-in", authorize("Admin"), punchIn);
router.post("/punch-out", authorize("Admin"), punchOut);
router.post("/manual", authorize("Admin"), manualMark);
router.post("/bulk-manual", authorize("Admin"), bulkManualMark);
router.put("/correction/:id", authorize("Admin"), approveCorrection);

// ── Admin & Manager read operations ───────────────────────────
router.get("/monthly", authorize("Admin", "Manager"), getMonthlyAttendance);
router.get("/daily", authorize("Admin", "Manager"), getDailyAttendance);
router.get("/range", authorize("Admin", "Manager"), getAttendanceRange);
router.get("/report", authorize("Admin", "Manager"), getAttendanceReport);

// ── Correction request (any authenticated user) ───────────────
router.post("/correction", requestCorrection);

module.exports = router;
