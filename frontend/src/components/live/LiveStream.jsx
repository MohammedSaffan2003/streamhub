import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useLive } from "./LiveContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./LiveStream.css";

const LiveStream = () => {
  const { isLive, setIsLive, activeStreamer, setActiveStreamer } = useLive();
  const zegoRef = useRef(null);
  const containerRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [role, setRole] = useState("");
  const [showRoleSelector, setShowRoleSelector] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const cleanupZego = async () => {
    try {
      if (zegoRef.current) {
        if (typeof zegoRef.current.leaveRoom === "function") {
          await zegoRef.current.leaveRoom();
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (typeof zegoRef.current.destroy === "function") {
          zegoRef.current.destroy();
        }
        zegoRef.current = null;
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    } finally {
      setIsInitialized(false);
      setIsLive(false);
      setActiveStreamer(null);
      setRole("");
      setShowRoleSelector(true);
    }
  };

  useEffect(() => {
    return () => {
      cleanupZego();
    };
  }, []);

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

      if (!containerRef.current) {
        console.error("Container not found");
        return;
      }

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoRef.current = zp;

      const config = {
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.LiveStreaming,
          config: {
            role: userRole === "Host" ? 1 : 0,
          },
        },
        showUserList: true,
        showRoomDetailsButton: true,
        showTextChat: true,
        showUserJoinAndLeave: true,
        maxUsers: 50,
        layout: "Grid",
        showLayoutButton: true,
        branding: {
          logoURL: "",
        },
        sharedLinks: [],
      };

      if (userRole === "Host") {
        config.turnOnCameraWhenJoining = true;
        config.turnOnMicrophoneWhenJoining = true;
        config.showMyMicrophoneToggleButton = true;
        config.showMyCameraToggleButton = true;
        config.showAudioVideoSettingsButton = true;
        config.showScreenSharingButton = true;
      }

      config.onJoinRoom = () => {
        setShowRoleSelector(false);
        if (userRole === "Host") {
          setIsLive(true);
          setActiveStreamer({ userName: username });
        }
      };

      config.onLeaveRoom = async () => {
        await cleanupZego();
        navigate("/");
      };

      config.onError = (error) => {
        console.error("Zego error:", error);
        cleanupZego();
      };

      await zp.joinRoom(config);
    } catch (error) {
      console.error("Error initializing Zego:", error);
      setShowRoleSelector(true);
      cleanupZego();
    }
  };

  useEffect(() => {
    const init = async () => {
      if (isInitialized) return;

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const response = await fetch("http://localhost:5000/api/user", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserName(data.username);
        setUserData({ ...data, decoded });
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing:", error);
        navigate("/login");
      }
    };

    init();
  }, [isInitialized, navigate]);

  const handleRoleSelect = async (selectedRole) => {
    if (!userData) return;
    setRole(selectedRole);
    await initializeZego(userData.username, userData.decoded.id, selectedRole);
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
      <div className="stream-container">
        <div ref={containerRef} className="zego-container" />
        {showRoleSelector && (
          <div className="role-selector">
            <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
              <button
                type="button"
                className="host-button"
                onClick={() => handleRoleSelect("Host")}
                id="host-button"
                name="host-button"
                autoComplete="off"
                aria-label="Start streaming"
              >
                Start Streaming
              </button>
              <button
                type="button"
                className="audience-button"
                onClick={() => handleRoleSelect("Audience")}
                id="audience-button"
                name="audience-button"
                autoComplete="off"
                aria-label="Watch stream"
              >
                Watch Stream
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStream;
