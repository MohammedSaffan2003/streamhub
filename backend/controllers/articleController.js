const Article = require('../models/Article');
const { cloudinary } = require('../config/cloudinary');

exports.createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    let imageUrl = null;
    let cloudinaryId = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'articles',
      });
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    const article = new Article({
      title,
      content,
      image: imageUrl,
      cloudinaryId,
      author: req.user.id
    });

    await article.save();

    const populatedArticle = await Article.findById(article._id)
      .populate('author', 'name');

    res.status(201).json(populatedArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Error creating article' });
  }
};

exports.listArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const articles = await Article.find(query)
      .populate('author', 'username name')
      .populate('comments.user', 'username name')
      .populate('likes', 'username name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Article.countDocuments(query);
    const hasMore = total > skip + articles.length;

    res.json({
      articles,
      hasMore,
      total
    });
  } catch (error) {
    console.error('Error listing articles:', error);
    res.status(500).json({ error: 'Error fetching articles' });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'username name')
      .populate('comments.user', 'username name')
      .populate('likes', 'username name')
      .lean();

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Error fetching article' });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      author: req.user.id
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const { title, content } = req.body;
    let imageUrl = article.image;
    let cloudinaryId = article.cloudinaryId;

    if (req.file) {
      if (cloudinaryId) {
        await cloudinary.uploader.destroy(cloudinaryId);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'articles',
      });
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    article.title = title;
    article.content = content;
    article.image = imageUrl;
    article.cloudinaryId = cloudinaryId;

    await article.save();
    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Error updating article' });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      author: req.user.id
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.cloudinaryId) {
      await cloudinary.uploader.destroy(article.cloudinaryId);
    }

    await article.deleteOne();
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Error deleting article' });
  }
};

exports.likeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('likes', 'name');
      
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const userId = req.user.id;
    const likeIndex = article.likes.findIndex(like => like._id.toString() === userId);
    const isLiked = likeIndex !== -1;

    if (isLiked) {
      // Remove like
      article.likes.splice(likeIndex, 1);
    } else {
      // Add like
      article.likes.push(userId);
    }

    await article.save();

    // Get updated article with populated likes
    const updatedArticle = await Article.findById(article._id)
      .populate('likes', 'name');

    res.json({
      likes: updatedArticle.likes,
      liked: !isLiked,
      likesCount: updatedArticle.likes.length
    });
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ error: 'Error liking article' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = {
      user: req.user.id,
      text: text.trim(),
      createdAt: new Date()
    };

    article.comments.push(comment);
    await article.save();

    // Fetch the updated article with populated user data
    const updatedArticle = await Article.findById(req.params.id)
      .populate('author', 'username name')
      .populate('comments.user', 'username name')
      .populate('likes', 'username name')
      .lean();

    res.json(updatedArticle);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Error adding comment' });
  }
}; 