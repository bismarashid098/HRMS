const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

// Admin & Manager - read only
router.get("/", authorize("Admin", "Manager"), getEmployees);
router.get("/:id", authorize("Admin", "Manager"), getEmployeeById);

// Admin only - write operations
router.post("/", authorize("Admin"), createEmployee);
router.put("/:id", authorize("Admin"), updateEmployee);
router.delete("/:id", authorize("Admin"), deleteEmployee);

module.exports = router;
