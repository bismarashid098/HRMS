const express = require("express");
const { getHolidays, getHolidayById, createHoliday, updateHoliday, deleteHoliday } = require("../controllers/holidayController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorizePermission("holidays"), getHolidays);
router.get("/:id", authorizePermission("holidays"), getHolidayById);
router.post("/", authorizePermission("holidays"), createHoliday);
router.put("/:id", authorizePermission("holidays"), updateHoliday);
router.delete("/:id", authorizePermission("holidays"), deleteHoliday);

module.exports = router;
