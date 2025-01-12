const Article = require("../models/Article");
const cloudinary = require("../config/cloudinary");

exports.createArticle = async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const thumbnail = req.file;

    let thumbnailUrl = "";
    if (thumbnail) {
      const result = await cloudinary.uploader.upload(thumbnail.path, {
        folder: "article-thumbnails",
      });
      thumbnailUrl = result.secure_url;
    }

    const article = new Article({
      userId: req.user.id,
      title,
      description,
      content,
      thumbnailUrl,
    });

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Error creating article" });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username")
      .populate("likes", "username");

    const total = await Article.countDocuments();

    res.json({
      articles,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalArticles: total,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching articles" });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate("userId", "username")
      .populate("likes", "username");

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: "Error fetching article" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    const userLiked = article.likes.includes(req.user.id);
    if (userLiked) {
      article.likes = article.likes.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      article.likes.push(req.user.id);
    }

    await article.save();
    res.json({ likes: article.likes.length, userLiked: !userLiked });
  } catch (error) {
    res.status(500).json({ error: "Error updating like" });
  }
};
