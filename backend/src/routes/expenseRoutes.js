const express = require("express");
const { getExpenses, getExpenseById, createExpense, updateExpenseStatus, deleteExpense } = require("../controllers/expenseController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { upload, withFolder } = require("../middleware/uploadMiddleware");

const router = express.Router();
router.use(protect, authorize("Admin"));

router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.post("/", withFolder("receipts"), upload.single("receipt"), createExpense);
router.put("/:id/status", updateExpenseStatus);
router.delete("/:id", deleteExpense);

module.exports = router;
