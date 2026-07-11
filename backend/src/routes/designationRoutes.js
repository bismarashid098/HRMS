const express = require("express");
const { getDesignations, getDesignationById, createDesignation, updateDesignation, deleteDesignation } = require("../controllers/designationController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", authorizePermission("designations"), getDesignations);
router.get("/:id", authorizePermission("designations"), getDesignationById);
router.post("/", authorizePermission("designations"), createDesignation);
router.put("/:id", authorizePermission("designations"), updateDesignation);
router.delete("/:id", authorizePermission("designations"), deleteDesignation);

module.exports = router;
