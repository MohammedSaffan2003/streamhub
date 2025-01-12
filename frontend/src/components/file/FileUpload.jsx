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

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only PDF and DOC files are allowed");
        return;
      }

      setFile(file);
      setName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name || !description) {
      setError("Please fill in all fields");
      return;
    }

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

      console.log(
        "Uploading to:",
        "http://localhost:5000/api/files/upload-file"
      );

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

      console.log("Upload response:", response);

      setFile(null);
      setName("");
      setDescription("");
      setProgress(0);
      onUploadComplete?.(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      console.error("Error details:", error.response);
      setError(error.response?.data?.error || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="file-upload"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <h2>Upload File</h2>
      <p className="supported-files">
        Supported files: PDF, DOC, DOCX (Max size: 10MB)
      </p>

      <form onSubmit={handleSubmit}>
        <div
          className="drop-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
          />
          {file ? (
            <div className="selected-file">📄 {file.name}</div>
          ) : (
            <div className="drop-text">
              <span>📁 Drag & Drop or Click to Browse</span>
            </div>
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
            required
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
