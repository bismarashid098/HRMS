const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getDeletedEmployees,
  updateEmployee,
  deleteEmployee,
  restoreEmployee
} = require("../controllers/employeeController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.get("/deleted", authorize("Admin"), getDeletedEmployees);
router.get("/", authorize("Admin", "Manager"), getEmployees);
router.get("/:id", authorize("Admin", "Manager"), getEmployeeById);
router.post("/", authorize("Admin"), createEmployee);
router.put("/:id", authorize("Admin"), updateEmployee);
router.put("/:id/restore", authorize("Admin"), restoreEmployee);
router.delete("/:id", authorize("Admin"), deleteEmployee);

module.exports = router;
