import React, { createContext, useContext, useState } from "react";

const LiveContext = createContext();

export const LiveProvider = ({ children }) => {
  const [isLive, setIsLive] = useState(false);
  const [activeStreamer, setActiveStreamer] = useState(null);
  const [viewers, setViewers] = useState([]);

  const value = {
    isLive,
    setIsLive,
    activeStreamer,
    setActiveStreamer,
    viewers,
    setViewers,
  };

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
};

export const useLive = () => {
  const context = useContext(LiveContext);
  if (!context) {
    throw new Error("useLive must be used within a LiveProvider");
  }
  return context;
};
