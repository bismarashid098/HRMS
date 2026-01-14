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

router.post("/", authorize("Admin", "HR"), createEmployee);
router.get("/", authorize("Admin", "HR"), getEmployees);
router.get("/:id", authorize("Admin", "HR"), getEmployeeById);
router.put("/:id", authorize("Admin", "HR"), updateEmployee);
router.delete("/:id", authorize("Admin"), deleteEmployee);

module.exports = router;
