import React from "react";
import { useNavigate } from "react-router-dom";
import "./VideoCard.css";

const VideoCard = ({
  video,
  onLike,
  showActions = true,
  onEdit,
  onDelete,
  isOwnVideo = false,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/video/${video._id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(video);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this video?")) {
      onDelete(video._id);
    }
  };

  return (
    <div className="video-card">
      <div className="video-thumbnail" onClick={handleClick}>
        <img
          src={video.thumbnailUrl || "default-thumbnail.jpg"}
          alt={video.title}
        />
        <div className="video-duration">{video.duration}</div>
      </div>
      <div className="video-info">
        <h3>{video.title}</h3>
        <p className="video-description">{video.description}</p>
        <div className="video-actions">
          {showActions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(video._id);
              }}
              className="like-button"
            >
              👍 {video.likes}
            </button>
          )}
          <span>{video.comments?.length || 0} comments</span>
          {isOwnVideo && (
            <div className="video-owner-actions">
              <button onClick={handleEditClick} className="edit-button">
                Edit
              </button>
              <button onClick={handleDeleteClick} className="delete-button">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
