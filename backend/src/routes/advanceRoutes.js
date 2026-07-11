const express = require("express");
const {
  requestAdvance,
  getAdvances,
  updateAdvanceStatus,
  getEmployeeLedger,
  deleteAdvance
} = require("../controllers/advanceController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.post("/", protect, authorizePermission("advance-salary"), requestAdvance);
router.get("/ledger", protect, authorizePermission("advance-salary"), getEmployeeLedger);
router.get("/", protect, authorizePermission("advance-salary"), getAdvances);
router.put("/:id", protect, authorizePermission("advance-salary"), updateAdvanceStatus);
router.delete("/:id", protect, authorizePermission("advance-salary"), deleteAdvance);

module.exports = router;
