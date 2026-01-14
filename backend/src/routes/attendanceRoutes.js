const express = require("express");
const {
  punchIn,
  punchOut,
  getMonthlyAttendance,
  requestCorrection,
  approveCorrection
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.post("/punch-in", authorize("Admin", "HR", "Employee"), punchIn);
router.post("/punch-out", authorize("Admin", "HR", "Employee"), punchOut);

router.get("/", authorize("Admin", "HR"), getMonthlyAttendance);

router.post("/correction", authorize("Employee"), requestCorrection);
router.put("/correction/:id", authorize("Admin", "HR"), approveCorrection);

module.exports = router;
