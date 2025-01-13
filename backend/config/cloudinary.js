const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Simple URL generation without complications
const generateUrl = (publicId, fileType) => {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    secure: true,
  });
};

module.exports = { cloudinary, generateUrl };
