import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import VideoCard from "./VideoCard";
import "./ProfilePage.css";
import EditVideoModal from "./EditVideoModal";
import EditProfileModal from "./EditProfileModal";
import FileCard from "./file/FileCard";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showVideoEditModal, setShowVideoEditModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const [userFiles, setUserFiles] = useState([]);
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

  useEffect(() => {
    if (activeTab === 'files') {
      fetchUserFiles();
    }
  }, [activeTab]);

  const fetchUserFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/files/user-files', {
        headers: { 'x-auth-token': token }
      });
      setUserFiles(response.data);
    } catch (error) {
      console.error('Error fetching user files:', error);
    }
  };

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

  const handleVideoEdit = (video) => {
    setEditingVideo(video);
    setShowVideoEditModal(true);
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
      setShowVideoEditModal(false);
      setEditingVideo(null);
    } catch (error) {
      console.error("Error updating video:", error);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleFileDelete = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/files/delete-file/${fileId}`, {
        headers: { 'x-auth-token': token }
      });
      await fetchUserFiles(); // Refresh the files list
    } catch (error) {
      console.error('Error deleting file:', error);
    }
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
            onClick={() => setShowProfileEditModal(true)}
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

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Your Videos
        </button>
        <button 
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Your Files
        </button>
      </div>

      {activeTab === 'videos' ? (
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
                  onEdit={handleVideoEdit}
                  onDelete={handleDelete}
                  showActions={true}
                  isOwnVideo={true}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="user-files">
          <div className="file-grid">
            {userFiles.map(file => (
              <FileCard
                key={file._id}
                file={file}
                onDelete={handleFileDelete}
                showDeleteButton={true}
              />
            ))}
          </div>
          {userFiles.length === 0 && (
            <p className="no-files">No files uploaded yet</p>
          )}
        </div>
      )}

      {showVideoEditModal && editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => {
            setShowVideoEditModal(false);
            setEditingVideo(null);
          }}
          onUpdate={handleUpdate}
        />
      )}

      {showProfileEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowProfileEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default ProfilePage;
