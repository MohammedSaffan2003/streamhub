import React, { useState } from "react";
import FileUpload from "../components/file/FileUpload";
import FileList from "../components/file/FileList";
import "./styles/FilesPage.css";

const FilesPage = () => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="files-page">
      <div className="files-header">
        <h1>Files</h1>
        <button
          className="upload-button"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? "Close Upload" : "Upload File"}
        </button>
      </div>

      {showUpload && (
        <FileUpload
          onUploadComplete={() => {
            setShowUpload(false);
            window.location.reload();
          }}
        />
      )}

      <FileList />
    </div>
  );
};

export default FilesPage;
