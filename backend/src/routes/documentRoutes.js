const express = require("express");
const { getDocuments, getDocumentById, uploadDocument, updateDocument, deleteDocument } = require("../controllers/documentController");
const protect = require("../middleware/authMiddleware");
const { authorizePermission } = require("../middleware/permissionMiddleware");
const { upload, withFolder } = require("../middleware/uploadMiddleware");

const router = express.Router();
router.use(protect, authorizePermission("documents"));

router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.post("/", withFolder("documents"), upload.single("file"), uploadDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
