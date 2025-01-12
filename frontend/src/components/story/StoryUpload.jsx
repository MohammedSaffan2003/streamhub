import React, { useState } from "react";
import axios from "axios";
import "./styles/StoryUpload.css";

const StoryUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type.startsWith("video/")) {
        const videoUrl = URL.createObjectURL(selectedFile);
        setPreview(videoUrl);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", file.type.startsWith("video/") ? "video" : "image");

    try {
      setUploading(true);
      await axios.post("http://localhost:5000/api/stories/upload", formData, {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      setTitle("");
      setPreview(null);
      onUploadComplete?.();
    } catch (error) {
      console.error("Error uploading story:", error);
      alert("Failed to upload story");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="story-upload">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter story title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="file">Upload Media</label>
          <input
            type="file"
            id="file"
            onChange={handleFileSelect}
            accept="image/*,video/*"
            required
          />
        </div>

        {preview && (
          <div className="preview">
            {file?.type.startsWith("image/") ? (
              <img src={preview} alt="Preview" />
            ) : (
              <video src={preview} controls />
            )}
          </div>
        )}

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Story"}
        </button>
      </form>
    </div>
  );
};

export default StoryUpload;
