const express = require("express");
const { getShifts, getShiftById, createShift, updateShift, deleteShift } = require("../controllers/shiftController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorize("Admin", "Manager"), getShifts);
router.get("/:id", authorize("Admin", "Manager"), getShiftById);
router.post("/", authorize("Admin"), createShift);
router.put("/:id", authorize("Admin"), updateShift);
router.delete("/:id", authorize("Admin"), deleteShift);

module.exports = router;
