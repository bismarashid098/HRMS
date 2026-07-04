const express = require("express");
const {
  applyLeave,
  updateLeaveStatus,
  getMyLeaves,
  getAllLeaves,
  adminEditLeave,
  cancelLeave,
  getLeaveBalance,
  deleteLeave
} = require("../controllers/leaveController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", authorize("Admin", "Manager"), applyLeave);
router.get("/balance/:employeeId", authorize("Admin", "Manager"), getLeaveBalance);
router.get("/my/:employeeId", authorize("Admin", "Manager"), getMyLeaves);
router.get("/", authorize("Admin", "Manager"), getAllLeaves);
router.put("/:id", authorize("Admin", "Manager"), updateLeaveStatus);
router.put("/:id/cancel", authorize("Admin", "Manager"), cancelLeave);
router.patch("/:id", authorize("Admin"), adminEditLeave);
router.delete("/:id", authorize("Admin"), deleteLeave);

module.exports = router;
