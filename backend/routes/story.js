const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/auth");
const storyController = require("../controllers/storyController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  storyController.uploadStory
);
router.get("/", verifyToken, storyController.getStories);
router.get("/:id", verifyToken, storyController.getStoryById);
router.put("/:id/view", verifyToken, storyController.incrementViews);

module.exports = router;
