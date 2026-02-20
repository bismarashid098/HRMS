const express = require("express");
const { requestAdvance, getAdvances, updateAdvanceStatus } = require("../controllers/advanceController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, requestAdvance);
router.get("/", protect, getAdvances);
router.put("/:id", protect, authorize("Admin", "HR"), updateAdvanceStatus);

module.exports = router;
