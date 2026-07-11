const express = require("express");
const { getAssets, getAssetById, createAsset, updateAsset, assignAsset, returnAsset, deleteAsset } = require("../controllers/assetController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();
router.use(protect, authorizePermission("assets"));

router.get("/", getAssets);
router.get("/:id", getAssetById);
router.post("/", createAsset);
router.put("/:id", updateAsset);
router.post("/:id/assign", assignAsset);
router.post("/:id/return", returnAsset);
router.delete("/:id", deleteAsset);

module.exports = router;
