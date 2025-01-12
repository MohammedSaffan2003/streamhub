import React, { useState, useRef } from "react";
import axios from "axios";
import "./styles/FileUpload.css";

const FileUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    setError("");
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }
      setFile(file);
      setName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("description", description);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token");
      }

      const response = await axios.post(
        "http://localhost:5000/api/files/upload-file",
        formData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      setFile(null);
      setName("");
      setDescription("");
      setProgress(0);
      onUploadComplete?.(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error.response?.data?.error || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <form onSubmit={handleSubmit}>
        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          {file ? (
            <div className="file-info">
              <p>{file.name}</p>
              <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <p>Drag & drop a file here or click to browse</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="name">File Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter file name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter file description"
            rows="3"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {uploading && (
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
            <span>{progress}%</span>
          </div>
        )}

        <button type="submit" disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
