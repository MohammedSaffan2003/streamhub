import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player";
import "./VideoPage.css";

const VideoPage = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [quality, setQuality] = useState("auto");

  const qualities = ["240", "360", "480", "720", "1080", "auto"];

  useEffect(() => {
    fetchVideoData();
  }, [videoId]);

  const fetchVideoData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/videos/${videoId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setVideo(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/videos/${videoId}/comments`,
        { comment },
        {
          headers: { "x-auth-token": token },
        }
      );
      fetchVideoData(); // Refresh video data to show new comment
      setComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      if (error.response?.status === 404) {
        alert("Video not found");
      } else {
        alert(error.response?.data || "Error posting comment");
      }
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/videos/${videoId}/like`,
        {},
        {
          headers: { "x-auth-token": token },
        }
      );
      fetchVideoData(); // Refresh video data to update like count
    } catch (error) {
      console.error("Error liking video:", error);
      if (error.response?.status === 400) {
        alert("You have already liked this video");
      } else {
        alert(error.response?.data || "Error liking video");
      }
    }
  };

  const getVideoUrl = (url, quality) => {
    if (quality === "auto") return url;
    return `${url.split("upload/")[0]}upload/q_${quality}/${
      url.split("upload/")[1]
    }`;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="video-page">
      <div className="video-content">
        <div className="video-player-wrapper">
          <div className="video-player-container">
            <ReactPlayer
              url={getVideoUrl(video.url, quality)}
              controls
              width="100%"
              height="100%"
              playing
              className="react-player"
            />
            <div className="quality-controls">
              {qualities.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`quality-button ${quality === q ? "active" : ""}`}
                >
                  {q === "auto" ? "Auto" : `${q}p`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="video-info">
          <h1>{video.title}</h1>
          <div className="video-stats">
            <button onClick={handleLike} className="like-button">
              👍 {video.likes} Likes
            </button>
            <span className="video-views">{video.views || 0} views</span>
          </div>
          <p className="video-description">{video.description}</p>
        </div>

        <div className="comments-section">
          <h3>Comments</h3>
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              required
            />
            <button type="submit">Post</button>
          </form>
          <div className="comments-list">
            {video.comments.map((comment, index) => (
              <div key={index} className="comment">
                <strong>{comment.username}</strong>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                <p>{comment.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
