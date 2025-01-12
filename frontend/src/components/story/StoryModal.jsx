import React, { useEffect, useRef } from "react";
import "./styles/StoryModal.css";

const StoryModal = ({ story, onClose }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="story-modal-overlay">
      <div className="story-modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        {story.type === "video" ? (
          <video src={story.url} controls autoPlay className="story-content" />
        ) : (
          <img src={story.url} alt={story.title} className="story-content" />
        )}
        <div className="story-info">
          <h2>{story.title}</h2>
          <p>{story.views} views</p>
        </div>
      </div>
    </div>
  );
};

export default StoryModal;
