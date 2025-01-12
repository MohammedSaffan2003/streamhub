const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const verifyToken = require("../middleware/auth");

router.get("/messages/:userId", verifyToken, chatController.getMessages);
router.post("/messages", verifyToken, chatController.sendMessage);

module.exports = router;
