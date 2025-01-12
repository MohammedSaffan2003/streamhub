import React from "react";
import { getFileIcon, getFileTypeLabel } from "../../utils/fileHelpers";
import "./styles/FileCard.css";

const FileCard = ({ file, onDelete }) => {
  const handleView = () => {
    if (file.fileType.startsWith("image/")) {
      window.open(file.url, "_blank");
    } else if (
      file.fileType === "application/pdf" ||
      file.fileType.includes("document")
    ) {
      // For PDFs and documents, open in a new tab using Google Docs Viewer
      window.open(
        `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}`,
        "_blank"
      );
    } else {
      // For other files, trigger download
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="file-card">
      <div className="file-icon">{getFileIcon(file.fileType)}</div>
      <div className="file-info">
        <h3>{file.name}</h3>
        <p className="file-description">{file.description}</p>
        <div className="file-meta">
          <span>{getFileTypeLabel(file.fileType)}</span>
          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      </div>
      <div className="file-actions">
        <button onClick={handleView} className="view-button">
          {file.fileType.startsWith("image/") ? "View" : "Download"}
        </button>
        <button onClick={() => onDelete(file._id)} className="delete-button">
          Delete
        </button>
      </div>
    </div>
  );
};

export default FileCard;
