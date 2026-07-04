const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, "../../uploads", req.uploadFolder || "misc");
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type. Allowed: JPEG, PNG, WEBP, PDF, DOC, DOCX, XLS, XLSX"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// Middleware factory to set subfolder
const withFolder = (folder) => (req, res, next) => {
  req.uploadFolder = folder;
  next();
};

module.exports = { upload, withFolder };
