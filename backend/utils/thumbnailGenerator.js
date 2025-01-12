const ffmpeg = require("fluent-ffmpeg");
const cloudinary = require("../config/cloudinary");

exports.generateThumbnail = async (videoPath) => {
  try {
    const thumbnailPath = `${videoPath}_thumb.jpg`;

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ["50%"],
          filename: thumbnailPath,
          size: "320x240",
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const result = await cloudinary.uploader.upload(thumbnailPath, {
      folder: "story-thumbnails",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
};
