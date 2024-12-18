// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Server } = require("socket.io");
const http = require("http");
const User = require("./models/User");
const Video = require("./models/Video");
const Chat = require("./models/Chat");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// const User = mongoose.model("User", userSchema);

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).send("User created");
  } catch (error) {
    res.status(400).send("Error creating user");
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware for JWT verification
const verifyToken = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

// Video upload endpoint
app.post(
  "/api/upload-video",
  verifyToken,
  upload.single("video"),
  async (req, res) => {
    const { title, description } = req.body;
    if (!req.file) {
      return res.status(400).send("No video file uploaded");
    }

    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "video" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        // Convert buffer to readable stream
        const bufferStream = require("stream").Readable.from(req.file.buffer);
        bufferStream.pipe(uploadStream);
      });

      const result = await uploadPromise;

      const video = new Video({
        title,
        description,
        url: result.secure_url,
        userId: req.user.id,
      });

      await video.save();
      res.status(201).send("Video uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).send("Error uploading video");
    }
  }
);

// Retrieve all videos
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await Video.find().sort({ likes: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Search videos
app.get("/api/videos/search", async (req, res) => {
  const { query } = req.query;
  try {
    const videos = await Video.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    res.json(videos);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Like video
app.post("/api/like-video", verifyToken, async (req, res) => {
  const { videoId } = req.body;
  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).send("Video not found");

    video.likes += 1;
    await video.save();
    res.send("Video liked");
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Comment on video
app.post("/api/comment-video", verifyToken, async (req, res) => {
  const { videoId, comment } = req.body;
  try {
    // Validate inputs
    if (!videoId || !comment) {
      return res.status(400).send("VideoId and comment are required");
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).send("Video not found");

    // Create comment object and validate before pushing
    const newComment = {
      username: req.user.username, // req.user should be set by verifyToken middleware
      comment: comment,
    };

    video.comments.push(newComment);

    try {
      await video.save();
      res.send("Comment added");
    } catch (validationError) {
      console.error("Validation error:", validationError);
      res.status(400).send("Invalid comment data");
    }
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).send("Error adding comment");
  }
});

// Real-time chat with Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

// Online users endpoint
app.get("/api/online-users", verifyToken, async (req, res) => {
  try {
    const onlineUsers = await User.find({ online: true });
    res.json(onlineUsers);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
