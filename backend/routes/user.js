const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/auth");

router.get("/", verifyToken, userController.getCurrentUser);
router.get("/online", verifyToken, userController.getOnlineUsers);
router.put("/profile", verifyToken, userController.updateProfile);

module.exports = router;
