const Video = require("../models/Video");
const cloudinary = require("../config/cloudinary");

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Error fetching videos" });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "videos",
    });

    const newVideo = new Video({
      title: req.body.title,
      description: req.body.description,
      url: result.secure_url,
      userId: req.user.id,
      thumbnailUrl: result.thumbnail_url,
    });

    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Error uploading video" });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      "userId",
      "username"
    );
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Error fetching video" });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Error updating video" });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting video" });
  }
};
