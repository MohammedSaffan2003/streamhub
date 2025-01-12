import React, { useState } from "react";
import StoryCarousel from "./StoryCarousel";
import ArticleGrid from "./ArticleGrid";
import StoryUpload from "./StoryUpload";
import "./styles/StoriesPage.css";

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
        <StoryUpload onUploadComplete={() => setShowUpload(false)} />
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
