// src/components/HomePage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import "./HomePage.css"; // Assuming we already have this CSS file for the HomePage

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState({});

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/videos");
        console.log("Fetched videos:", response.data);
        setVideos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      }
    };
    fetchVideos();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/videos/search?query=${searchQuery}`
      );
      setVideos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error searching videos:", error);
      setVideos([]);
    }
  };

  return (
    <div className="homepage-container">
      <div className="search-container">
        <input
          type="text"
          id="searchQuery"
          name="searchQuery"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search videos..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      <div className="video-grid">
        {videos.map((video) => (
          <div key={video._id} className="video-item">
            <h3>{video.title}</h3>

            {/* Conditionally render thumbnail or player */}
            {selectedVideoId !== video._id && (
              <div
                className="video-thumbnail"
                onClick={() => setSelectedVideoId(video._id)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={`${video.title} thumbnail`}
                  width="100%"
                />
              </div>
            )}

            {selectedVideoId === video._id && (
              <>
                <ReactPlayer
                  url={video.url}
                  controls
                  width="100%"
                  height="auto"
                />
              </>
            )}

            <p>Likes: {video.likes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
