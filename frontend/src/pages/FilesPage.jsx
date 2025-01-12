import React from "react";
import FileUpload from "../components/file/FileUpload";
import FileList from "../components/file/FileList";
import "./styles/FilesPage.css";

const FilesPage = () => {
  const handleUploadComplete = () => {
    // Refresh the file list
    window.location.reload();
  };

  return (
    <div className="files-page">
      <div className="files-header">
        <h1>File Management</h1>
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>
      <FileList />
    </div>
  );
};

export default FilesPage;
