const express = require("express");
const {
  applyLeave,
  updateLeaveStatus,
  getMyLeaves,
  getAllLeaves
} = require("../controllers/leaveController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", applyLeave);
router.get("/my/:employeeId", getMyLeaves);
router.get("/", getAllLeaves);
router.put("/:id", updateLeaveStatus);
module.exports = router;



// Yes Committed
