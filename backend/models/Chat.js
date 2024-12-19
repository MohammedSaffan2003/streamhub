// models/Chat.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [
    {
      timestamp: { type: Date, default: Date.now },
      message: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Chat", chatSchema);
