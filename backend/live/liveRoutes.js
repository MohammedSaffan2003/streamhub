const express = require("express");
const router = express.Router();
const liveController = require("./liveController");
const verifyToken = require("../middleware/auth");

router.post(
  "/start",
  verifyToken,
  liveController.startStream.bind(liveController)
);
router.post(
  "/stop",
  verifyToken,
  liveController.stopStream.bind(liveController)
);
router.get(
  "/status",
  verifyToken,
  liveController.getStreamStatus.bind(liveController)
);

module.exports = router;
