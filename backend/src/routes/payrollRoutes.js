const express = require("express");
const {
  generatePayroll,
  approvePayroll,
  getPayrollHistory,
  getAllPayrolls,
  getPayrollOverview
} = require("../controllers/payrollController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.post("/generate", authorize("Admin"), generatePayroll);
router.get("/", authorize("Admin"), getAllPayrolls);
router.get("/overview", authorize("Admin"), getPayrollOverview);
router.put("/:id/approve", authorize("Admin"), approvePayroll);
router.get("/employee/:employeeId", authorize("Admin"), getPayrollHistory);

module.exports = router;
