import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useLive } from "./LiveContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./LiveStream.css";

const LiveStream = () => {
  const { isLive, setIsLive, activeStreamer, setActiveStreamer } = useLive();
  const zegoRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (isInitialized) return;

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const response = await fetch("http://localhost:5000/api/user", {
            headers: {
              "x-auth-token": token,
            },
          });
          const userData = await response.json();
          setUserName(userData.username);

          const container = document.querySelector("#live-streaming-container");
          if (container) {
            const roleButtons = document.createElement("div");
            roleButtons.className = "role-selector";
            roleButtons.innerHTML = `
              <button class="host-button">Start Streaming</button>
              <button class="audience-button">Watch Stream</button>
            `;
            container.appendChild(roleButtons);

            roleButtons
              .querySelector(".host-button")
              .addEventListener("click", () => {
                setRole("Host");
                container.removeChild(roleButtons);
                initializeZego(userData.username, decoded.id, "Host");
              });

            roleButtons
              .querySelector(".audience-button")
              .addEventListener("click", () => {
                setRole("Audience");
                container.removeChild(roleButtons);
                initializeZego(userData.username, decoded.id, "Audience");
              });
          }

          setIsInitialized(true);
        } catch (error) {
          console.error("Error initializing:", error);
        }
      }
    };

    init();

    return () => {
      if (zegoRef.current) {
        zegoRef.current.destroy();
        setIsInitialized(false);
      }
    };
  }, [isInitialized]);

  const initializeZego = async (username, userId, userRole) => {
    try {
      const appID = parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID);
      const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET;
      const roomID = "streamRoom1";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userId,
        username
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoRef.current = zp;

      const config = {
        container: document.querySelector("#live-streaming-container"),
        scenario: {
          mode: ZegoUIKitPrebuilt.LiveStreaming,
          config: {
            role:
              userRole === "Host"
                ? ZegoUIKitPrebuilt.Host
                : ZegoUIKitPrebuilt.Audience,
          },
        },
        showUserList: true,
        showRoomDetailsButton: true,
      };

      if (userRole === "Host") {
        config.showPreJoinView = true;
        config.showLeavingView = true;
        config.showCameraButton = true;
        config.showMicrophoneButton = true;
        config.showScreenSharingButton = true;
      }

      config.onUserCountUpdate = (count) => {
        console.log("User count:", count);
      };
      config.onUserJoin = (users) => {
        console.log("Users joined:", users);
      };
      config.onUserLeave = (users) => {
        console.log("Users left:", users);
      };
      config.onLiveStart = (user) => {
        setIsLive(true);
        setActiveStreamer(user);
      };
      config.onLiveEnd = () => {
        setIsLive(false);
        setActiveStreamer(null);
      };
      config.onLeaveRoom = () => {
        if (zegoRef.current) {
          zegoRef.current.destroy();
          setIsInitialized(false);
        }
        navigate("/");
      };

      await zp.joinRoom(config);
    } catch (error) {
      console.error("Error initializing Zego:", error);
    }
  };

  if (!userName) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="live-stream-page">
      <div className="stream-header">
        <h2>{role === "Host" ? "Start Streaming" : "Live Stream"}</h2>
        {activeStreamer && (
          <div className="streamer-info">Live: {activeStreamer.userName}</div>
        )}
      </div>
      <div id="live-streaming-container" className="stream-container" />
    </div>
  );
};

export default LiveStream;
