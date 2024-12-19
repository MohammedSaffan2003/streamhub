import React, { useState, useRef } from "react";
import axios from "axios";
import "./VideoUploadPage.css";

const VideoUploadPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
    } else {
      alert("Please select a valid video file");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a video file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/upload-video/", formData, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      alert("Video uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <form onSubmit={handleUpload} className="upload-form">
        <h2>Upload Video</h2>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            required
          />
        </div>

        <div className="form-group">
          <div className="file-input-container">
            <label className="file-input-label">
              <span>{file ? file.name : "Click to select video file"}</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="video/*"
                required
              />
            </label>
          </div>
        </div>

        {uploading && (
          <div className="upload-progress">
            <div
              className="progress-bar"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <button type="submit" className="upload-button" disabled={uploading}>
          {uploading ? `Uploading... ${uploadProgress}%` : "Upload Video"}
        </button>
      </form>
    </div>
  );
};

export default VideoUploadPage;
