// server.js
require("dotenv").config();
const cors = require("cors");
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
const ChatRoom = require("./models/ChatRoom");
const ChatMessage = require("./models/ChatMessage");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
});

const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from React app on this port
  methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
  allowedHeaders: "Content-Type,Authorization,x-auth-token", // Include x-auth-token
  credentials: true, // Allow cookies to be sent (if needed)
};

app.use(cors(corsOptions));

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

    // Update user's online status
    user.online = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h", // Token expires in 24 hours
      }
    );

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
const verifyToken = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).send("User not found");
    }
    req.user = {
      id: decoded.id,
      username: user.username,
      email: user.email,
      rewardCoins: user.rewardCoins,
    };
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

// User data endpoint
app.get("/api/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      rewardCoins: user.rewardCoins,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Server error");
  }
});

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

      // Generate a thumbnail
      const thumbnailUrl = cloudinary.url(result.public_id, {
        resource_type: "video",
        format: "jpg",
        transformation: [{ width: 300, crop: "scale" }],
      });

      const video = new Video({
        title,
        description,
        url: result.secure_url,
        userId: req.user.id,
        thumbnailUrl,
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

// At the top of the file, add a Map to store socket-user associations
const userSockets = new Map();

// Update the socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_connected", async (userId) => {
    try {
      userSockets.set(socket.id, userId);
      socket.userId = userId;

      await User.findByIdAndUpdate(userId, { online: true });

      const onlineUsers = await User.find(
        { online: true, _id: { $ne: userId } },
        "username _id"
      );

      io.emit("online_users_updated", onlineUsers);
    } catch (error) {
      console.error("Error in user_connected:", error);
    }
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log("User joined room:", roomId);
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log("User left room:", roomId);
  });

  socket.on("disconnect", async () => {
    try {
      const userId = userSockets.get(socket.id);
      if (userId) {
        await User.findByIdAndUpdate(userId, { online: false });
        userSockets.delete(socket.id);

        const onlineUsers = await User.find({ online: true }, "username _id");
        io.emit("online_users_updated", onlineUsers);
      }
    } catch (error) {
      console.error("Error in disconnect:", error);
    }
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
// Logout endpoint
app.post("/api/logout", verifyToken, async (req, res) => {
  try {
    // Update user's online status
    await User.findByIdAndUpdate(req.user.id, { online: false });

    // Emit user status update to other clients
    const onlineUsers = await User.find({ online: true }, "username _id");
    io.emit("online_users_updated", onlineUsers);

    res.send("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send("Server error");
  }
});

// Get videos for specific user
app.get("/api/videos/user/:userId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).send("User ID is required");
    }

    // console.log("Fetching videos for user:", userId);
    const videos = await Video.find({ userId: userId }).sort({
      createdAt: -1, // Sort by newest first
    });

    // console.log("Found videos:", videos);
    res.json(videos);
  } catch (error) {
    console.error("Error fetching user videos:", error);
    res.status(500).send("Server error");
  }
});

// Get single video by ID
app.get("/api/videos/:videoId", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).send("Video not found");
    }
    res.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).send("Server error");
  }
});

// Create chat room
app.post("/api/chat/rooms", verifyToken, async (req, res) => {
  try {
    const { name, participants } = req.body;
    const room = new ChatRoom({
      name,
      participants: [...participants, req.user.id],
      createdBy: req.user.id,
    });
    await room.save();
    res.json(room);
  } catch (error) {
    res.status(500).send("Error creating chat room");
  }
});

// Get chat rooms for user
app.get("/api/chat/rooms", verifyToken, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user.id,
    }).populate("participants", "username");
    res.json(rooms);
  } catch (error) {
    res.status(500).send("Error fetching chat rooms");
  }
});

// Get chat history
app.get("/api/chat/:roomId", verifyToken, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      roomId: req.params.roomId,
    }).populate("sender", "username");
    res.json(messages);
  } catch (error) {
    res.status(500).send("Error fetching chat history");
  }
});

// Update video
app.put("/api/videos/:videoId", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).send("Video not found");
    }

    // Check if the user owns the video
    if (video.userId.toString() !== req.user.id) {
      return res.status(403).send("Not authorized to edit this video");
    }

    const { title, description } = req.body;
    video.title = title;
    video.description = description;
    await video.save();

    res.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).send("Server error");
  }
});

// Delete video
app.delete("/api/videos/:videoId", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).send("Video not found");
    }

    // Check if the user owns the video
    if (video.userId.toString() !== req.user.id) {
      return res.status(403).send("Not authorized to delete this video");
    }

    // Use findByIdAndDelete instead of remove()
    await Video.findByIdAndDelete(req.params.videoId);

    // Also delete the video from Cloudinary if needed
    if (video.url) {
      const publicId = video.url.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with the response even if Cloudinary delete fails
      }
    }

    res.json({ msg: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).send("Server error");
  }
});

// Add comment to video
app.post("/api/videos/:videoId/comments", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).send("Video not found");
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const newComment = {
      userId: req.user.id,
      username: user.username,
      comment: req.body.comment,
      createdAt: new Date(),
    };

    video.comments.push(newComment);
    await video.save();

    res.json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Server error");
  }
});

// Like video (with restriction)
app.post("/api/videos/:videoId/like", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).send("Video not found");
    }

    // Check if user has already liked the video
    if (video.likedBy && video.likedBy.includes(req.user.id)) {
      return res.status(400).send("You have already liked this video");
    }

    // Initialize likedBy array if it doesn't exist
    if (!video.likedBy) {
      video.likedBy = [];
    }

    // Add user to likedBy array and increment likes
    video.likedBy.push(req.user.id);
    video.likes += 1;
    await video.save();

    res.json({ likes: video.likes });
  } catch (error) {
    console.error("Error liking video:", error);
    res.status(500).send("Server error");
  }
});

// Get online users
app.get("/api/users/online", verifyToken, async (req, res) => {
  try {
    const onlineUsers = await User.find(
      { online: true, _id: { $ne: req.user.id } },
      "username _id"
    );
    res.json(onlineUsers);
  } catch (error) {
    console.error("Error fetching online users:", error);
    res.status(500).send("Server error");
  }
});

// Start chat
app.post("/api/chat/start", verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).send("Recipient not found");
    }

    // Check if chat room already exists
    let room = await ChatRoom.findOne({
      participants: {
        $all: [req.user.id, recipientId],
        $size: 2,
      },
    });

    if (!room) {
      room = new ChatRoom({
        participants: [req.user.id, recipientId],
        lastMessage: null,
      });
      await room.save();
    }

    // Populate participant information
    await room.populate("participants", "username");

    res.json(room);
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).send("Server error");
  }
});

// Send message
app.post("/api/chat/message", verifyToken, async (req, res) => {
  try {
    const { roomId, content } = req.body;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).send("Chat room not found");
    }

    if (!room.participants.includes(req.user.id)) {
      return res.status(403).send("Not authorized");
    }

    const user = await User.findById(req.user.id);
    const message = new ChatMessage({
      roomId,
      sender: req.user.id,
      content,
      timestamp: new Date(),
    });

    await message.save();
    room.lastMessage = message._id;
    await room.save();

    const messageWithSender = {
      ...message.toObject(),
      sender: {
        _id: user._id,
        username: user.username,
      },
    };

    // Broadcast to everyone in the room
    io.in(roomId).emit("new_message", {
      roomId,
      message: messageWithSender,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Server error");
  }
});

// Get messages for a room
app.get("/api/chat/messages/:roomId", verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).send("Chat room not found");
    }

    if (!room.participants.includes(req.user.id)) {
      return res.status(403).send("Not authorized");
    }

    const messages = await ChatMessage.find({ roomId })
      .populate("sender", "username")
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Server error");
  }
});

// Update user profile
app.put("/api/user/update", verifyToken, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).send("Current password is incorrect");
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).send("Email is already in use");
      }
    }

    // Update user fields
    user.username = username;
    user.email = email;

    // Update password if provided
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Return updated user without password
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      rewardCoins: user.rewardCoins,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Server error");
  }
});

app.options("*", cors(corsOptions)); // Preflight requests
// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
