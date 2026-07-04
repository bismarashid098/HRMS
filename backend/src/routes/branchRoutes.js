const express = require("express");
const { getBranches, getBranchById, createBranch, updateBranch, deleteBranch } = require("../controllers/branchController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorize("Admin", "Manager"), getBranches);
router.get("/:id", authorize("Admin", "Manager"), getBranchById);
router.post("/", authorize("Admin"), createBranch);
router.put("/:id", authorize("Admin"), updateBranch);
router.delete("/:id", authorize("Admin"), deleteBranch);

module.exports = router;
