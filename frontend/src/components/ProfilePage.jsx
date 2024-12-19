import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [videos, setVideos] = useState([]);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get("http://localhost:5000/api/user", {
          headers: { "x-auth-token": token },
        });
        setUser(userResponse.data);

        const videosResponse = await axios.get(
          `http://localhost:5000/api/videos/user/${userResponse.data._id}`,
          {
            headers: { "x-auth-token": token },
          }
        );
        setVideos(videosResponse.data);

        const totalLikes = videosResponse.data.reduce(
          (acc, video) => acc + video.likes,
          0
        );
        setRewardCoins(totalLikes);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Reward Coins: {rewardCoins}</p>

      <h3>Your Videos</h3>
      <div className="video-grid">
        {videos.map((video) => (
          <div
            key={video._id}
            className="video-item"
            onClick={() => handleVideoClick(video._id)}
            style={{ cursor: "pointer" }}
          >
            <h3>{video.title}</h3>
            <div className="video-thumbnail">
              <img
                src={video.thumbnailUrl || "default-thumbnail.jpg"}
                alt={video.title}
                width="100%"
              />
            </div>
            <p>Likes: {video.likes}</p>
          </div>
        ))}
      </div>
      <Link to="/upload-video" className="upload-button">
        Upload New Video
      </Link>
    </div>
  );
};

export default ProfilePage;
