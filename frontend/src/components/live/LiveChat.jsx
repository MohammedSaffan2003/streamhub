import React, { useState, useRef, useEffect } from "react";
import { useStream } from "./StreamContext";
import "./LiveStream.css";

function LiveChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const { activeStreamer } = useStream();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      username: localStorage.getItem("username") || "Anonymous",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  return (
    <div className="live-chat">
      <div className="chat-header">
        <h3>Live Chat</h3>
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="chat-message">
            <span className="message-username">{message.username}</span>
            <span className="message-text">{message.text}</span>
            <span className="message-time">{message.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default LiveChat;
