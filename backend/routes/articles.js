const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middleware/auth');
const articleController = require('../controllers/articleController');

// Configure multer for image upload
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Routes
router.post('/create', verifyToken, upload.single('image'), articleController.createArticle);
router.get('/list', verifyToken, articleController.listArticles);
router.get('/:id', verifyToken, articleController.getArticle);
router.put('/:id', verifyToken, upload.single('image'), articleController.updateArticle);
router.delete('/:id', verifyToken, articleController.deleteArticle);
router.post('/:id/like', verifyToken, articleController.likeArticle);

module.exports = router; 