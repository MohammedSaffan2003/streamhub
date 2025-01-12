import React, { useState } from "react";
import StoryCarousel from "../components/story/StoryCarousel";
import ArticleGrid from "../components/story/ArticleGrid";
import StoryUpload from "../components/story/StoryUpload";
import "../components/story/styles/StoriesPage.css";

const StoriesPage = () => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="stories-page">
      <div className="stories-header">
        <h1>Stories & Articles</h1>
        <button
          className="upload-button"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? "Close Upload" : "Share Story"}
        </button>
      </div>

      {showUpload && (
        <StoryUpload
          onUploadComplete={() => {
            setShowUpload(false);
            // Refresh stories after upload
            window.location.reload();
          }}
        />
      )}

      <section className="stories-section">
        <h2>Recent Stories</h2>
        <StoryCarousel />
      </section>

      <section className="articles-section">
        <h2>Articles</h2>
        <ArticleGrid />
      </section>
    </div>
  );
};

export default StoriesPage;
