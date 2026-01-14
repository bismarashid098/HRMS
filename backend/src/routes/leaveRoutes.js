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

router.post("/", authorize("Employee"), applyLeave);
router.get("/my/:employeeId", authorize("Employee"), getMyLeaves);

router.get("/", authorize("Admin", "HR"), getAllLeaves);
router.put("/:id", authorize("Admin", "HR"), updateLeaveStatus);

module.exports = router;
