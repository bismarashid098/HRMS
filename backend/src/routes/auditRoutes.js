const express = require("express");
const { getAuditLogs, exportAuditLogs, getAuditMeta } = require("../controllers/auditController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);
router.use(authorize("Admin"));

router.get("/meta", getAuditMeta);
router.get("/export", exportAuditLogs);
router.get("/", getAuditLogs);

module.exports = router;
