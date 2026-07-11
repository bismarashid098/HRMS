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
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(protect);

router.get("/deleted", authorizePermission("employees"), getDeletedEmployees);
router.get("/", authorizePermission("employees"), getEmployees);
router.get("/:id", authorizePermission("employees"), getEmployeeById);
router.post("/", authorizePermission("employees"), createEmployee);
router.put("/:id", authorizePermission("employees"), updateEmployee);
router.put("/:id/restore", authorizePermission("employees"), restoreEmployee);
router.delete("/:id", authorizePermission("employees"), deleteEmployee);

module.exports = router;
