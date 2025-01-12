import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/StoryCarousel.css";
import StoryModal from "./StoryModal";

const StoryCarousel = () => {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/stories", {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      setStories(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stories:", error);
      setLoading(false);
    }
  };

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    incrementViews(story._id);
  };

  const incrementViews = async (storyId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/story/${storyId}/view`,
        {},
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  if (loading) return <div className="story-loading">Loading stories...</div>;

  return (
    <div className="story-carousel-container">
      <div className="story-carousel">
        {stories.map((story) => (
          <div
            key={story._id}
            className="story-item"
            onClick={() => handleStoryClick(story)}
          >
            <div className="story-thumbnail">
              <img src={story.thumbnailUrl} alt={story.title} />
              <div className="story-overlay">
                <span className="play-icon">▶</span>
                <span className="view-count">{story.views} views</span>
              </div>
            </div>
            <h3 className="story-title">{story.title}</h3>
          </div>
        ))}
      </div>

      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
};

export default StoryCarousel;
