const Story = require("../models/Story");
const { generateThumbnail } = require("../utils/thumbnailGenerator");
const cloudinary = require("../config/cloudinary");

exports.uploadStory = async (req, res) => {
  try {
    const { title, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: type === "video" ? "video" : "image",
      folder: "stories",
    });

    // Generate thumbnail for videos
    let thumbnailUrl = result.secure_url;
    if (type === "video") {
      thumbnailUrl = await generateThumbnail(file.path);
    }

    const story = new Story({
      userId: req.user.id,
      title,
      type,
      url: result.secure_url,
      thumbnailUrl,
    });

    await story.save();
    res.status(201).json(story);
  } catch (error) {
    console.error("Error uploading story:", error);
    res.status(500).json({ error: "Error uploading story" });
  }
};

exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .populate("userId", "username");
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching stories" });
  }
};

exports.incrementViews = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    // Check if user already viewed
    const alreadyViewed = story.views.some(
      (view) => view.userId.toString() === userId
    );
    if (!alreadyViewed) {
      story.views.push({ userId });
      await story.save();
    }

    res.json({ views: story.views.length });
  } catch (error) {
    res.status(500).json({ error: "Error updating views" });
  }
};
