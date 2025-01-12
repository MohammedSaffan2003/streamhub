const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/auth");
const articleController = require("../controllers/articleController");

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
  "/create",
  verifyToken,
  upload.single("thumbnail"),
  articleController.createArticle
);
router.get("/", verifyToken, articleController.getArticles);
router.get("/:id", verifyToken, articleController.getArticleById);
router.put("/:id/like", verifyToken, articleController.toggleLike);

module.exports = router;
