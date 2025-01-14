import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import FileViewer from "./FileViewer";
import "./styles/FileCard.css";

const getFileIcon = (fileType) => {
  if (fileType.includes("pdf")) {
    return "📄";
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return "📝";
  } else if (fileType.includes("image")) {
    return "🖼️";
  } else if (fileType.includes("video")) {
    return "🎥";
  } else if (fileType.includes("audio")) {
    return "🎵";
  } else if (fileType.includes("zip") || fileType.includes("compressed")) {
    return "🗜️";
  } else if (fileType.includes("text")) {
    return "📋";
  } else {
    return "📁";
  }
};

const FileCard = ({ file, onDelete, showDeleteButton = false }) => {
  const [showViewer, setShowViewer] = useState(false);

  const handleDownload = () => {
    window.open(file.url, "_blank");
  };

  const handleView = () => {
    setShowViewer(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      onDelete(file._id);
    }
  };

  return (
    <>
      <div className="file-card">
        <div className="file-icon">{getFileIcon(file.fileType)}</div>
        <div className="file-info">
          <h3 className="file-name">{file.name}</h3>
          <p className="file-description">{file.description}</p>
          <p className="file-meta">
            {(file.size / (1024 * 1024)).toFixed(2)} MB •
            {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
            {file.uploadedBy && <span> • Uploaded by {file.uploadedBy}</span>}
          </p>
        </div>
        <div className="file-actions">
          <button onClick={handleDownload} className="download-btn">
            ⬇️ Download
          </button>
          <button onClick={handleView} className="read-btn">
            👀 View
          </button>
          {showDeleteButton && (
            <button onClick={handleDelete} className="delete-btn">
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      {showViewer && (
        <FileViewer file={file} onClose={() => setShowViewer(false)} />
      )}
    </>
  );
};

export default FileCard;
