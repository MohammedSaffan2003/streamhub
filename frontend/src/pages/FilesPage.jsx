import React, { useState } from "react";
import FileUpload from "../components/file/FileUpload";
import FileList from "../components/file/FileList";
import "./styles/FilesPage.css";

const FilesPage = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleUploadComplete = () => {
    // Hide the upload form and refresh the file list without page reload
    setShowUploadForm(false);
  };

  return (
    <div className="files-page">
      <div className="files-header">
        <div className="header-content">
          <h1>File Management</h1>
          <button 
            className="upload-button"
            onClick={() => setShowUploadForm(true)}
          >
            Upload File
          </button>
        </div>
        {showUploadForm && (
          <div className="upload-modal-overlay">
            <div className="upload-modal">
              <button 
                className="close-button"
                onClick={() => setShowUploadForm(false)}
              >
                ×
              </button>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        )}
      </div>
      <FileList />
    </div>
  );
};

export default FilesPage;
