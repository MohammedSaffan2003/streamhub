const File = require("../models/File");
const { cloudinary, generateUrl } = require("../config/cloudinary");
const fs = require("fs").promises;

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name, description } = req.body;

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "files",
        access_mode: "public",
        use_filename: true,
      });

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
    res.status(500).json({ error: "Error uploading file" });
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

    const validFiles = await Promise.all(
      files.map(async (file) => {
        try {
          const result = await cloudinary.api.resource(file.cloudinaryId, {
            resource_type: "raw",
          });
          return {
            ...file.toObject(),
            url: result.secure_url,
          };
        } catch (error) {
          await File.deleteOne({ _id: file._id });
          return null;
        }
      })
    );

    const filteredFiles = validFiles.filter((file) => file !== null);
    const total = await File.countDocuments(searchQuery);

    res.json({
      files: filteredFiles,
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
