import React, { useState } from "react";
import "./EditVideoModal.css";

const EditVideoModal = ({ video, onClose, onUpdate }) => {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...video,
      title,
      description,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Video</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideoModal;
