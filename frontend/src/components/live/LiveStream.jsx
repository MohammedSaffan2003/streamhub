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
  const [isJoining, setIsJoining] = useState(false);

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
      if (userRole === "Host") {
        try {
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } catch (error) {
          console.error("Failed to get media permissions:", error);
          throw new Error(
            "Please allow camera and microphone access to stream"
          );
        }
      }

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
        throw new Error("Container not found");
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
        config.showLeaveButton = true;
      }

      config.onJoinRoom = () => {
        if (userRole === "Host") {
          setIsLive(true);
          setActiveStreamer({ userName: username });
        }
      };

      config.onLeaveRoom = async () => {
        await handleStopStream();
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
      throw error;
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
    if (!userData || isJoining) return;
    setIsJoining(true);
    setRole(selectedRole);
    setShowRoleSelector(false);
    try {
      await initializeZego(
        userData.username,
        userData.decoded.id,
        selectedRole
      );
    } catch (error) {
      setShowRoleSelector(true);
      setRole("");
    }
    setIsJoining(false);
  };

  const handleStopStream = async () => {
    if (zegoRef.current) {
      try {
        if (role === "Host" && zegoRef.current.stopPublishingStream) {
          await zegoRef.current.stopPublishingStream();
        }
        await cleanupZego();
        navigate("/");
      } catch (error) {
        console.error("Error stopping stream:", error);
      }
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
          <div className="streamer-info">
            <span>Live: {activeStreamer.userName}</span>
            {role === "Host" && (
              <button
                onClick={handleStopStream}
                className="stop-stream-button"
                aria-label="Stop streaming"
              >
                Stop Stream
              </button>
            )}
          </div>
        )}
      </div>
      <div className="stream-container">
        <div ref={containerRef} className="zego-container" />
        {showRoleSelector && !isJoining && (
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
                disabled={isJoining}
              >
                {isJoining ? "Starting..." : "Start Streaming"}
              </button>
              <button
                type="button"
                className="audience-button"
                onClick={() => handleRoleSelect("Audience")}
                id="audience-button"
                name="audience-button"
                autoComplete="off"
                aria-label="Watch stream"
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Watch Stream"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStream;
