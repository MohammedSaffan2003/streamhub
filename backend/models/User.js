// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  rewardCoins: { type: Number, default: 0 },
  online: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
