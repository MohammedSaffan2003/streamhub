import React, { useState } from "react";
import "./LiveStream.css";

function StreamControls({ onStop }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleAudio = () => {
    setIsMuted(!isMuted);
    // Implement audio toggle logic
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // Implement video toggle logic
  };

  return (
    <div className="stream-controls">
      <button onClick={toggleAudio}>{isMuted ? "Unmute" : "Mute"}</button>
      <button onClick={toggleVideo}>
        {isVideoOff ? "Start Video" : "Stop Video"}
      </button>
      <button onClick={onStop} className="stop-stream">
        End Stream
      </button>
    </div>
  );
}

export default StreamControls;
