const express = require("express");
const {
  getSettings,
  updateSettings
} = require("../controllers/settingsController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router.get("/", getSettings);
router.put("/", updateSettings);

module.exports = router;
