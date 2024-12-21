import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useLive } from "./LiveContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./LiveStream.css";

const generateZegoToken = (appID, serverSecret, roomID, userID, userName) => {
  try {
    return ZegoUIKitPrebuilt.generateKitTokenForTest(
      parseInt(appID),
      serverSecret,
      roomID,
      userID,
      userName
    );
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

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
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  const cleanupZego = async () => {
    try {
      if (zegoRef.current) {
        try {
          const localTracks = zegoRef.current.getLocalTracks?.();
          if (localTracks) {
            localTracks.forEach((track) => track.stop());
          }
        } catch (e) {
          console.warn("Error stopping tracks:", e);
        }

        if (zegoRef.current.status?.isInRoom) {
          try {
            await zegoRef.current.leaveRoom();
          } catch (e) {
            console.warn("Error leaving room:", e);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          if (zegoRef.current?.destroy) {
            await zegoRef.current.destroy();
          }
        } catch (e) {
          console.warn("Error destroying instance:", e);
        }

        zegoRef.current = null;
      }
    } catch (error) {
      console.warn("Cleanup warning:", error);
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
          const permissions = await navigator.permissions.query({
            name: "camera",
          });

          if (permissions.state === "denied") {
            throw new Error("Camera permission denied");
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          stream.getTracks().forEach((track) => {
            track.stop();
          });
        } catch (error) {
          console.error("Media permission error:", error);
          if (
            error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError"
          ) {
            throw new Error(
              "Please allow camera and microphone access in your browser settings to stream"
            );
          }
          throw error;
        }
      }

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/zego/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          role: userRole,
          roomId: "streamRoom1",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get streaming token");
      }

      const { appID, serverSecret, roomID, userID, userName } =
        await response.json();

      const kitToken = generateZegoToken(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
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
        showLeaveButton: true,
        showEndRoomButton: userRole === "Host",
        onLeaveRoom: () => {
          if (zegoRef.current) {
            const localTracks = zegoRef.current.getLocalTracks?.();
            if (localTracks) {
              localTracks.forEach((track) => track.stop());
            }
          }
          handleStopStream();
        },
        onEndRoom: () => {
          handleStopStream();
        },
        showLeavingView: true,
        leavingView: {
          allowClose: false,
          afterLeave: () => {
            handleStopStream();
          },
        },
        enableCamera: userRole === "Host",
        enableMicrophone: userRole === "Host",
        showMyCameraToggleButton: userRole === "Host",
        showMyMicrophoneToggleButton: userRole === "Host",
        turnOnCameraWhenJoining: false,
        turnOnMicrophoneWhenJoining: false,
        showAudioVideoSettingsButton: userRole === "Host",
        cameraDeviceConfig: {
          facingMode: "user",
          mirror: false,
        },
        onDeviceError: (error) => {
          console.warn("Device error:", error);
          if (error.code === 1103064) {
            alert("Please allow camera and microphone access to stream");
          }
        },
        onScreenSharingError: (error) => {
          if (error.code === 1103042) {
            console.warn("Screen sharing cancelled by user");
          } else {
            console.error("Screen sharing error:", error);
          }
        },
        videoConfig: {
          resolution: {
            width: 1280,
            height: 720,
          },
          bitrate: 1500,
          frameRate: 30,
          mirror: false,
        },
        screenSharingConfig: {
          resolution: {
            width: 1920,
            height: 1080,
          },
          bitrate: 2000,
          frameRate: 30,
        },
      };

      config.onJoinRoom = () => {
        if (userRole === "Host") {
          setIsLive(true);
          setActiveStreamer({ userName: username });
        }
      };

      config.onError = (error) => {
        console.error("Zego error:", error);
        if (error.code >= 1000) {
          cleanupZego();
        }
      };

      config.onConnectionStateChanged = (state) => {
        console.log("Connection state:", state);
        if (state === "DISCONNECTED") {
          cleanupZego();
        }
      };

      await zp.joinRoom(config);
    } catch (error) {
      console.error("Initialization error:", error);
      alert(
        error.message || "Failed to initialize streaming. Please try again."
      );
      setShowRoleSelector(true);
      await cleanupZego();
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
    setShowLeaveConfirmation(true);
  };

  const handleConfirmLeave = async () => {
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
      {showLeaveConfirmation && (
        <div className="leave-confirmation-modal">
          <div className="modal-content">
            <h3>Leave Stream?</h3>
            <p>Are you sure you want to leave the stream?</p>
            <div className="modal-actions">
              <button
                onClick={() => setShowLeaveConfirmation(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button onClick={handleConfirmLeave} className="confirm-button">
                Leave Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStream;
