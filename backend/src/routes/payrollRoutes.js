const express = require("express");
const {
  generatePayroll,
  approvePayroll,
  getPayrollHistory,
  getAllPayrolls
} = require("../controllers/payrollController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.post("/generate", authorize("Admin", "HR"), generatePayroll);
router.get("/", authorize("Admin", "HR"), getAllPayrolls);
router.put("/:id/approve", authorize("Admin", "HR"), approvePayroll);
router.get(
  "/employee/:employeeId",
  authorize("Admin", "HR", "Employee"),
  getPayrollHistory
);

module.exports = router;
