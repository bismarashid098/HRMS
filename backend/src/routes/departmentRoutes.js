const express = require("express");
const { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require("../controllers/departmentController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorize("Admin", "Manager"), getDepartments);
router.get("/:id", authorize("Admin", "Manager"), getDepartmentById);
router.post("/", authorize("Admin"), createDepartment);
router.put("/:id", authorize("Admin"), updateDepartment);
router.delete("/:id", authorize("Admin"), deleteDepartment);

module.exports = router;
