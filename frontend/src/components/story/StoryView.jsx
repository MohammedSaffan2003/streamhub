import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/StoryView.css";

const StoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/stories/${id}`,
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        setStory(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching story:", error);
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading story...</div>;
  }

  if (!story) {
    return <div className="error">Story not found</div>;
  }

  return (
    <div className="story-view">
      <button className="back-button" onClick={() => navigate("/stories")}>
        ← Back to Stories
      </button>

      <div className="story-content">
        {story.type === "video" ? (
          <video src={story.url} controls autoPlay className="story-media" />
        ) : (
          <img src={story.url} alt={story.title} className="story-media" />
        )}

        <div className="story-info">
          <h1>{story.title}</h1>
          <div className="story-meta">
            <span>Posted by {story.userId.username}</span>
            <span>{new Date(story.createdAt).toLocaleString()}</span>
            <span>{story.views.length} views</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryView;
