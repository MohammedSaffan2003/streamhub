const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, index: true },
  url: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: { type: Number, default: 0 },
  comments: [
    {
      username: { type: String, required: true },
      comment: { type: String, required: true },
    },
  ],
  thumbnailUrl: { type: String },
});

module.exports = mongoose.model("Video", videoSchema);
