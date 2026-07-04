const express = require("express");
const {
  generatePayroll,
  approvePayroll,
  deletePayroll,
  getPayrollHistory,
  getAllPayrolls,
  getPayrollOverview,
  getPayrollBreakdown,
  getPayrollById
} = require("../controllers/payrollController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.post("/generate", authorize("Admin"), generatePayroll);
router.get("/overview", authorize("Admin"), getPayrollOverview);
router.get("/employee/:employeeId", authorize("Admin"), getPayrollHistory);
router.get("/", authorize("Admin"), getAllPayrolls);
router.get("/:id/breakdown", authorize("Admin"), getPayrollBreakdown);
router.get("/:id", authorize("Admin"), getPayrollById);
router.put("/:id/approve", authorize("Admin"), approvePayroll);
router.delete("/:id", authorize("Admin"), deletePayroll);

module.exports = router;
