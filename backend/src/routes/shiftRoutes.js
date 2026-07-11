const express = require("express");
const { getShifts, getShiftById, createShift, updateShift, deleteShift } = require("../controllers/shiftController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorizePermission("shifts"), getShifts);
router.get("/:id", authorizePermission("shifts"), getShiftById);
router.post("/", authorizePermission("shifts"), createShift);
router.put("/:id", authorizePermission("shifts"), updateShift);
router.delete("/:id", authorizePermission("shifts"), deleteShift);

module.exports = router;
