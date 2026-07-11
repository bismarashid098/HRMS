const express = require("express");
const { importAttendance, downloadTemplate, exportAttendance } = require("../controllers/biometricController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorizePermission("biometric"));

router.post("/import", importAttendance);
router.get("/template", downloadTemplate);
router.get("/export", exportAttendance);

module.exports = router;
