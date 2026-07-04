const express = require("express");
const { getDesignations, getDesignationById, createDesignation, updateDesignation, deleteDesignation } = require("../controllers/designationController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorize("Admin", "Manager"), getDesignations);
router.get("/:id", authorize("Admin", "Manager"), getDesignationById);
router.post("/", authorize("Admin"), createDesignation);
router.put("/:id", authorize("Admin"), updateDesignation);
router.delete("/:id", authorize("Admin"), deleteDesignation);

module.exports = router;
