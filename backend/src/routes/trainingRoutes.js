const express = require("express");
const { getTrainings, getTrainingById, createTraining, updateTraining, enrollEmployee, updateEnrollment, deleteTraining } = require("../controllers/trainingController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorize("Admin", "Manager"), getTrainings);
router.get("/:id", authorize("Admin", "Manager"), getTrainingById);
router.post("/", authorize("Admin"), createTraining);
router.put("/:id", authorize("Admin"), updateTraining);
router.post("/:id/enroll", authorize("Admin"), enrollEmployee);
router.put("/:id/enrollments/:employeeId", authorize("Admin"), updateEnrollment);
router.delete("/:id", authorize("Admin"), deleteTraining);

module.exports = router;
