import React from "react";
import { formatDistanceToNow } from "date-fns";
import "./styles/FileCard.css";

const FileCard = ({ file }) => {
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "application/pdf":
        return "📄";
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "📝";
      default:
        return "📁";
    }
  };

  const handleDownload = () => {
    window.open(file.url, "_blank");
  };

  const handleRead = () => {
    window.open(file.url, "_blank");
  };

  return (
    <div className="file-card">
      <div className="file-icon">{getFileIcon(file.fileType)}</div>
      <div className="file-info">
        <h3 className="file-name">{file.name}</h3>
        <p className="file-description">{file.description}</p>
        <p className="file-meta">
          {(file.size / (1024 * 1024)).toFixed(2)} MB •
          {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className="file-actions">
        <button onClick={handleDownload} className="download-btn">
          ⬇️ Download
        </button>
        <button onClick={handleRead} className="read-btn">
          👀 Read
        </button>
      </div>
    </div>
  );
};

export default FileCard;
