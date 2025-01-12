const ChatMessage = require("../models/ChatMessage");
const ChatRoom = require("../models/ChatRoom");

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const room = await ChatRoom.findOne({
      participants: { $all: [req.user.id, userId] },
    });

    if (!room) {
      return res.json({ messages: [] });
    }

    const messages = await ChatMessage.find({ roomId: room._id })
      .sort({ timestamp: 1 })
      .populate("sender", "username");

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Error fetching messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { toUserId, message } = req.body;

    let room = await ChatRoom.findOne({
      participants: { $all: [req.user.id, toUserId] },
    });

    if (!room) {
      room = new ChatRoom({
        participants: [req.user.id, toUserId],
      });
      await room.save();
    }

    const newMessage = new ChatMessage({
      roomId: room._id,
      sender: req.user.id,
      message,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Error sending message" });
  }
};
