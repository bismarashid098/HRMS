const express = require("express");
const { getAuditLogs, createAuditLog } = require("../controllers/auditController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, authorize("Admin"), getAuditLogs);
router.post("/", protect, createAuditLog);

module.exports = router;
