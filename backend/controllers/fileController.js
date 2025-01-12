const File = require("../models/File");
const cloudinary = require("../config/cloudinary");
const fs = require("fs").promises;
const { MAX_FILE_SIZE } = require("../config/constants");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name, description } = req.body;

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
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
      // Clean up local file if upload fails
      await fs.unlink(req.file.path);
      throw uploadError;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error uploading file" });
  }
};

exports.searchFiles = async (req, res) => {
  try {
    const { query = "" } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFiles: total,
    });
  } catch (error) {
    console.error("Error searching files:", error);
    res.status(500).json({ error: "Error searching files" });
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
    res.status(500).json({ error: "Error fetching file" });
  }
};
