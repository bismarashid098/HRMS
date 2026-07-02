const express = require("express");
const { importAttendance, downloadTemplate, exportAttendance } = require("../controllers/biometricController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router.post("/import", importAttendance);
router.get("/template", downloadTemplate);
router.get("/export", exportAttendance);

module.exports = router;
