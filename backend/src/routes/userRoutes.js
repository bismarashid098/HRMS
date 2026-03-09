const express = require("express");
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    toggleUserStatus,
    deleteUser
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", authorize("Admin"), getAllUsers);
router.get("/:id", authorize("Admin"), getUserById);
router.put("/:id/role", authorize("Admin"), updateUserRole);
router.put("/:id/status", authorize("Admin"), toggleUserStatus);
router.delete("/:id", authorize("Admin"), deleteUser);

module.exports = router;
