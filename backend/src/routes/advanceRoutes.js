const express = require("express");
const { requestAdvance, getAdvances, updateAdvanceStatus } = require("../controllers/advanceController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorize("Admin"), requestAdvance);
router.get("/", protect, authorize("Admin"), getAdvances);
router.put("/:id", protect, authorize("Admin"), updateAdvanceStatus);

module.exports = router;
