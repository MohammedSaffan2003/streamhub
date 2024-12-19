import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./ChatComponent.css";
import { jwtDecode } from "jwt-decode";

const socket = io("http://localhost:5000");

const ChatComponent = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      socket.emit("user_connected", decoded.id);
    }

    socket.on("user_status_changed", ({ userId, online }) => {
      setOnlineUsers((prev) => {
        if (online) {
          // Add user to online list if not already present
          if (!prev.find((u) => u._id === userId)) {
            // Fetch the user info if needed
            fetchOnlineUsers();
          }
        } else {
          // Remove user from online list
          return prev.filter((u) => u._id !== userId);
        }
        return prev;
      });
    });

    return () => {
      socket.off("user_status_changed");
    };
  }, []);

  useEffect(() => {
    return () => {
      // Emit logout when component unmounts
      const token = localStorage.getItem("token");
      if (token) {
        axios
          .post(
            "http://localhost:5000/api/logout",
            {},
            { headers: { "x-auth-token": token } }
          )
          .catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(interval);
      if (currentRoom) {
        socket.emit("leave_room", currentRoom._id);
      }
    };
  }, []);

  useEffect(() => {
    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message");
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/users/online",
        {
          headers: { "x-auth-token": token },
        }
      );
      setOnlineUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching online users:", error);
    }
  };

  const startChat = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/chat/start",
        { recipientId: userId },
        { headers: { "x-auth-token": token } }
      );

      if (currentRoom) {
        socket.emit("leave_room", currentRoom._id);
      }

      setCurrentRoom(response.data);
      socket.emit("join_room", response.data._id);

      // Fetch messages for this room
      const messagesResponse = await axios.get(
        `http://localhost:5000/api/chat/messages/${response.data._id}`,
        { headers: { "x-auth-token": token } }
      );
      setMessages(messagesResponse.data);

      const user = onlineUsers.find((u) => u._id === userId);
      setSelectedUser(user);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert(error.response?.data || "Error starting chat. Please try again.");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentRoom) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/chat/message",
        {
          roomId: currentRoom._id,
          content: message,
        },
        { headers: { "x-auth-token": token } }
      );
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleNewMessage = (data) => {
    if (data.roomId === currentRoom?._id) {
      setMessages((prev) => [
        ...prev,
        {
          ...data.message,
          sender: {
            _id: data.message.sender._id,
            username: data.message.sender.username,
          },
        },
      ]);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="chat-container">
      <div className="online-users">
        <h3>Online Users</h3>
        {onlineUsers.map((user) => (
          <div
            key={user._id}
            className={`user-item ${
              selectedUser?._id === user._id ? "active" : ""
            }`}
            onClick={() => startChat(user._id)}
          >
            {user.username}
          </div>
        ))}
      </div>

      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h3>Chat with {selectedUser.username}</h3>
            </div>
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender._id === currentUser?.id ? "sent" : "received"
                  }`}
                >
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="message-form">
              <input
                type="text"
                id="message-input"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                autoComplete="off"
                required
              />
              <button type="submit" id="send-button" name="send">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
