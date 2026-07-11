const express = require("express");
const { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require("../controllers/departmentController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorizePermission("departments"), getDepartments);
router.get("/:id", authorizePermission("departments"), getDepartmentById);
router.post("/", authorizePermission("departments"), createDepartment);
router.put("/:id", authorizePermission("departments"), updateDepartment);
router.delete("/:id", authorizePermission("departments"), deleteDepartment);

module.exports = router;
