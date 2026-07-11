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
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", authorizePermission("leaves"), applyLeave);
router.get("/balance/:employeeId", authorizePermission("leaves"), getLeaveBalance);
router.get("/my/:employeeId", authorizePermission("leaves"), getMyLeaves);
router.get("/", authorizePermission("leaves"), getAllLeaves);
router.put("/:id", authorizePermission("leaves"), updateLeaveStatus);
router.put("/:id/cancel", authorizePermission("leaves"), cancelLeave);
router.patch("/:id", authorizePermission("leaves"), adminEditLeave);
router.delete("/:id", authorizePermission("leaves"), deleteLeave);

module.exports = router;
