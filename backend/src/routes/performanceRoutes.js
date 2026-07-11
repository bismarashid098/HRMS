const express = require("express");
const { getReviews, getReviewById, createReview, updateReview, deleteReview } = require("../controllers/performanceController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorizePermission("performance"), getReviews);
router.get("/:id", authorizePermission("performance"), getReviewById);
router.post("/", authorizePermission("performance"), createReview);
router.put("/:id", authorizePermission("performance"), updateReview);
router.delete("/:id", authorizePermission("performance"), deleteReview);

module.exports = router;
