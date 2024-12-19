import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useStream } from "./StreamContext";
import "./LiveStream.css";

// Configure Agora client with all analytics disabled
AgoraRTC.setArea([AgoraRTC.AREAS.INDIA]);
AgoraRTC.setLogLevel(4);
AgoraRTC.disableLogUpload();

// Set individual parameters
AgoraRTC.setParameter("DISABLE_STATS_COLLECTOR", true);
AgoraRTC.setParameter("DISABLE_REPORT", true);
AgoraRTC.setParameter("UPLOAD_LOG", false);
AgoraRTC.setParameter("REPORT_STATS", false);
AgoraRTC.setParameter("COLLECT_STATS", false);
AgoraRTC.setParameter("SEND_STATS", false);
AgoraRTC.setParameter("STATS_INTERVAL", 0);
AgoraRTC.setParameter("UPLOAD_STATS", false);
AgoraRTC.setParameter("WEBSOCKET_TIMEOUT_MIN", 10000);
AgoraRTC.setParameter("WEBSOCKET_TIMEOUT_MAX", 15000);
AgoraRTC.setParameter("AUDIO_VOLUME_INDICATION_INTERVAL", 0);
AgoraRTC.setParameter("DUALSTREAM_MODE", 0);

// Create client with minimal configuration
const client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8",
  websocketRetryConfig: {
    timeout: 15000,
    maxRetryCount: 1,
    maxRetryTimeout: 2000,
  },
  useProxyServer: false,
});

const LiveStream = () => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [localTracks, setLocalTracks] = useState([]);
  const [error, setError] = useState(null);

  const cleanup = async () => {
    try {
      if (localTracks.length > 0) {
        localTracks.forEach((track) => {
          track.stop();
          track.close();
        });
        setLocalTracks([]);
      }
      if (client.connectionState === "CONNECTED") {
        await client.unpublish();
        await client.leave();
      }
      setIsStreaming(false);
      setIsWatching(false);
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  };

  const startStream = async () => {
    try {
      await cleanup(); // Cleanup before starting

      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks(
          {
            encoderConfig: "high_quality",
            optimizationMode: "motion",
            AEC: false,
            AGC: false,
            ANS: false,
          },
          {
            encoderConfig: {
              width: 640,
              height: 360,
              frameRate: 30,
              bitrateMin: 400,
              bitrateMax: 1000,
            },
            optimizationMode: "motion",
          }
        );

      await client.setClientRole("host");
      await client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        "main-channel",
        null,
        null
      );

      videoTrack.play(videoRef.current);
      await client.publish([audioTrack, videoTrack]);

      setLocalTracks([audioTrack, videoTrack]);
      setIsStreaming(true);
    } catch (err) {
      console.error("Error starting stream:", err);
      setError("Failed to start stream");
      await cleanup();
    }
  };

  const stopStream = async () => {
    try {
      await cleanup();
    } catch (err) {
      console.error("Error stopping stream:", err);
      setError("Failed to stop stream");
    }
  };

  const watchStream = async () => {
    try {
      await cleanup(); // Cleanup before watching

      await client.setClientRole("audience");
      await client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        "main-channel",
        null,
        null
      );

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          user.videoTrack.play(videoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      setIsWatching(true);
    } catch (err) {
      console.error("Error watching stream:", err);
      setError("Failed to watch stream");
      await cleanup();
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="live-stream-container">
      {error && <div className="error-message">{error}</div>}
      <div className="stream-main">
        <div className="video-container" ref={videoRef}></div>
        <div className="stream-controls">
          {!isStreaming && !isWatching ? (
            <>
              <button onClick={startStream} className="stream-button">
                Start Streaming
              </button>
              <button onClick={watchStream} className="watch-button">
                Watch Stream
              </button>
            </>
          ) : (
            <button onClick={stopStream} className="stop-button">
              {isStreaming ? "Stop Streaming" : "Stop Watching"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
