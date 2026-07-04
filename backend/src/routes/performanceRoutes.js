const express = require("express");
const { getReviews, getReviewById, createReview, updateReview, deleteReview } = require("../controllers/performanceController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorize("Admin", "Manager"), getReviews);
router.get("/:id", authorize("Admin", "Manager"), getReviewById);
router.post("/", authorize("Admin"), createReview);
router.put("/:id", authorize("Admin"), updateReview);
router.delete("/:id", authorize("Admin"), deleteReview);

module.exports = router;
