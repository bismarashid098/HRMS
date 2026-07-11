const express = require("express");
const {
  attendanceReport,
  leaveReport,
  payrollReport,
  advanceReport
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(protect);

router.get("/attendance", authorizePermission("reports"), attendanceReport);
router.get("/leaves", authorizePermission("reports"), leaveReport);
router.get("/payroll", authorizePermission("reports"), payrollReport);
router.get("/advances", authorizePermission("reports"), advanceReport);

module.exports = router;
