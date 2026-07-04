const express = require("express");
const { getMyNotifications, markAsRead, markAllRead, deleteNotification } = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", getMyNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
