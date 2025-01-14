const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/auth");
const fileController = require("../controllers/fileController");

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Routes
router.post(
  "/upload-file",
  verifyToken,
  upload.single("file"),
  fileController.uploadFile
);
router.get("/list-files", verifyToken, fileController.listFiles);
router.get("/file/:id", verifyToken, fileController.getFileById);
router.delete("/delete-file/:id", verifyToken, fileController.deleteFile);
router.get("/user-files", verifyToken, fileController.getUserFiles);

// Add this after your routes
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size is too large. Max limit is 10MB",
      });
    }
    return res.status(400).json({
      error: error.message,
    });
  }

  if (error.message === "Invalid file type") {
    return res.status(400).json({
      error: "Only PDF and DOC files are allowed",
    });
  }

  next(error);
});

module.exports = router;
