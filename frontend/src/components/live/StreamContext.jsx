import React, { createContext, useContext, useState } from "react";

const StreamContext = createContext();

export const StreamProvider = ({ children }) => {
  const [isLive, setIsLive] = useState(false);
  const [activeStreamer, setActiveStreamer] = useState(null);
  const [viewers, setViewers] = useState([]);
  const [streamError, setStreamError] = useState(null);

  const value = {
    isLive,
    setIsLive,
    activeStreamer,
    setActiveStreamer,
    viewers,
    setViewers,
    streamError,
    setStreamError,
  };

  return (
    <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
  );
};

export const useStream = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error("useStream must be used within a StreamProvider");
  }
  return context;
};
