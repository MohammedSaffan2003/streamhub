import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player";

const VideoPage = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/like-video",
        { videoId },
        {
          headers: { "x-auth-token": token },
        }
      );
      fetchVideoData(); // Refresh video data to update likes
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/comment-video",
        { videoId, comment },
        {
          headers: { "x-auth-token": token },
        }
      );
      setComment("");
      fetchVideoData(); // Refresh video data to show new comment
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!video) return <div>Video not found</div>;

  return (
    <div className="video-page">
      <h2>{video.title}</h2>
      <div className="video-player-container">
        <ReactPlayer
          url={video.url}
          controls
          width="100%"
          height="auto"
          playing
        />
      </div>
      <div className="video-info">
        <p>{video.description}</p>
        <div className="video-actions">
          <button onClick={handleLike} className="like-button">
            👍 {video.likes} Likes
          </button>
        </div>
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
              <strong>{comment.username}:</strong> {comment.comment}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPage; 