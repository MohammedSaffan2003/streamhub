const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const verifyToken = require("../middleware/auth");

router.get("/", verifyToken, videoController.getAllVideos);
router.post("/upload", verifyToken, videoController.uploadVideo);
router.get("/:id", verifyToken, videoController.getVideoById);
router.put("/:id", verifyToken, videoController.updateVideo);
router.delete("/:id", verifyToken, videoController.deleteVideo);

module.exports = router;
