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
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(protect);

router.post("/punch-in", authorizePermission("attendance"), punchIn);
router.post("/punch-out", authorizePermission("attendance"), punchOut);
router.post("/manual", authorizePermission("attendance"), manualMark);
router.post("/bulk-manual", authorizePermission("attendance"), bulkManualMark);
router.put("/correction/:id", authorizePermission("attendance"), approveCorrection);

router.get("/monthly", authorizePermission("attendance"), getMonthlyAttendance);
router.get("/daily", authorizePermission("attendance"), getDailyAttendance);
router.get("/range", authorizePermission("attendance"), getAttendanceRange);
router.get("/report", authorizePermission("attendance"), getAttendanceReport);

router.post("/correction", requestCorrection);

module.exports = router;
