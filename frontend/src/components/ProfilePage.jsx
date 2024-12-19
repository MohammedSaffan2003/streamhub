import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import VideoCard from "./VideoCard";
import "./ProfilePage.css";
import EditVideoModal from "./EditVideoModal";
import EditProfileModal from "./EditProfileModal";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        // First get user data
        const userResponse = await axios.get("http://localhost:5000/api/user", {
          headers: { "x-auth-token": token },
        });

        if (!userResponse.data || !userResponse.data.id) {
          console.error("Invalid user data received:", userResponse.data);
          return;
        }

        setUser(userResponse.data);

        // Then fetch user's videos
        const videosResponse = await axios.get(
          `http://localhost:5000/api/videos/user/${userResponse.data.id}`,
          {
            headers: { "x-auth-token": token },
          }
        );

        const userVideos = videosResponse.data;
        setVideos(userVideos);

        // Calculate reward coins: (total likes + number of videos) / 2
        const totalLikes = userVideos.reduce(
          (acc, video) => acc + video.likes,
          0
        );
        const calculatedRewards = Math.floor(
          (totalLikes + userVideos.length) / 2
        );
        setRewardCoins(calculatedRewards);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLike = async (videoId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/like-video",
        { videoId },
        {
          headers: { "x-auth-token": token },
        }
      );
      // Refresh videos after like
      const videosResponse = await axios.get(
        `http://localhost:5000/api/videos/user/${user.id}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setVideos(videosResponse.data);
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setShowEditModal(true);
  };

  const handleDelete = async (videoId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/api/videos/${videoId}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.data.msg) {
        // Show success message
        alert(response.data.msg);

        // Refresh videos after successful deletion
        const videosResponse = await axios.get(
          `http://localhost:5000/api/videos/user/${user.id}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        setVideos(videosResponse.data);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      // Show error message to user
      alert(error.response?.data || "Error deleting video");
    }
  };

  const handleUpdate = async (updatedVideo) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/videos/${updatedVideo._id}`,
        updatedVideo,
        {
          headers: { "x-auth-token": token },
        }
      );

      // Refresh videos after update
      const videosResponse = await axios.get(
        `http://localhost:5000/api/videos/user/${user.id}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setVideos(videosResponse.data);
      setShowEditModal(false);
      setEditingVideo(null);
    } catch (error) {
      console.error("Error updating video:", error);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-info">
        <div className="profile-header">
          <h2>Profile</h2>
          <button
            className="edit-profile-button"
            onClick={() => setShowEditModal(true)}
          >
            Edit Profile
          </button>
        </div>
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
        <p>Reward Coins: {rewardCoins}</p>
      </div>

      <div className="profile-actions">
        <Link to="/upload-video" className="upload-button">
          Upload New Video
        </Link>
      </div>

      <div className="user-videos">
        <h3>Your Videos</h3>
        {videos.length === 0 ? (
          <p>No videos uploaded yet</p>
        ) : (
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onLike={handleLike}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
                isOwnVideo={true}
              />
            ))}
          </div>
        )}
      </div>

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default ProfilePage;
