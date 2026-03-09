const express = require("express");
const {
  applyLeave,
  updateLeaveStatus,
  getMyLeaves,
  getAllLeaves
} = require("../controllers/leaveController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", authorize("Admin", "Manager"), applyLeave);
router.get("/my/:employeeId", authorize("Admin", "Manager"), getMyLeaves);
router.get("/", authorize("Admin", "Manager"), getAllLeaves);
router.put("/:id", authorize("Admin", "Manager"), updateLeaveStatus);

module.exports = router;
