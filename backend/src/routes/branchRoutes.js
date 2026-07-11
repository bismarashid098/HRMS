const express = require("express");
const { getBranches, getBranchById, createBranch, updateBranch, deleteBranch } = require("../controllers/branchController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorizePermission("branches"), getBranches);
router.get("/:id", authorizePermission("branches"), getBranchById);
router.post("/", authorizePermission("branches"), createBranch);
router.put("/:id", authorizePermission("branches"), updateBranch);
router.delete("/:id", authorizePermission("branches"), deleteBranch);

module.exports = router;
