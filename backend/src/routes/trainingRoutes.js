const express = require("express");
const { getTrainings, getTrainingById, createTraining, updateTraining, enrollEmployee, updateEnrollment, deleteTraining } = require("../controllers/trainingController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorizePermission("training"), getTrainings);
router.get("/:id", authorizePermission("training"), getTrainingById);
router.post("/", authorizePermission("training"), createTraining);
router.put("/:id", authorizePermission("training"), updateTraining);
router.post("/:id/enroll", authorizePermission("training"), enrollEmployee);
router.put("/:id/enrollments/:employeeId", authorizePermission("training"), updateEnrollment);
router.delete("/:id", authorizePermission("training"), deleteTraining);

module.exports = router;
