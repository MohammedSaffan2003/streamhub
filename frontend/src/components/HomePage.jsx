// src/components/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VideoCard from "./VideoCard";
import "./HomePage.css";

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
      const response = await axios.get("http://localhost:5000/api/videos");
      setVideos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error liking video:", error);
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
          <VideoCard key={video._id} video={video} onLike={handleLike} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
