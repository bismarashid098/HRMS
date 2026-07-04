const express = require("express");
const { getHolidays, getHolidayById, createHoliday, updateHoliday, deleteHoliday } = require("../controllers/holidayController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorize("Admin", "Manager"), getHolidays);
router.get("/:id", authorize("Admin", "Manager"), getHolidayById);
router.post("/", authorize("Admin"), createHoliday);
router.put("/:id", authorize("Admin"), updateHoliday);
router.delete("/:id", authorize("Admin"), deleteHoliday);

module.exports = router;
