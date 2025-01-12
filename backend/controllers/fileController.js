const File = require("../models/File");
const cloudinary = require("../config/cloudinary");
const fs = require("fs").promises;

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name, description } = req.body;

    try {
      console.log("File path:", req.file.path);
      console.log("File details:", req.file);

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "files",
      });

      // Delete the local file after upload
      await fs.unlink(req.file.path);

      const newFile = new File({
        userId: req.user.id,
        name: name || req.file.originalname,
        description,
        fileType: req.file.mimetype,
        size: req.file.size,
        url: result.secure_url,
        cloudinaryId: result.public_id,
      });

      await newFile.save();
      res.status(201).json(newFile);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      // Clean up local file if upload fails
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting local file:", unlinkError);
        }
      }
      throw uploadError;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      error: "Error uploading file",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const { query = "", page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const searchQuery = {
      userId: req.user.id,
      ...(query && {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      }),
    };

    const files = await File.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await File.countDocuments(searchQuery);

    res.json({
      files,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalFiles: total,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "Error listing files" });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.cloudinaryId);

    // Delete from MongoDB
    await file.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Error deleting file" });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(file);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: "Error fetching file" });
  }
};
