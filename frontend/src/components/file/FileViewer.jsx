import React, { useState, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import mammoth from "mammoth";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "./styles/FileViewer.css";

const FileViewer = ({ file, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [docxContent, setDocxContent] = useState("");
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (
      file.fileType.includes("wordprocessingml.document") ||
      file.fileType === "application/msword"
    ) {
      loadDocx();
    } else {
      setLoading(false);
    }
  }, [file]);

  const loadDocx = async () => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocxContent(result.value);
    } catch (error) {
      console.error("Error loading DOCX:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-viewer-overlay">
      <div className="file-viewer-container">
        <div className="file-viewer-header">
          <h3>{file.name}</h3>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="file-viewer-content">
          {loading && <div className="loading">Loading document...</div>}

          {file.fileType === "application/pdf" ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                fileUrl={file.url}
                plugins={[defaultLayoutPluginInstance]}
                defaultScale={1}
              />
            </Worker>
          ) : (
            <div
              id="docx-container"
              className="docx-container"
              dangerouslySetInnerHTML={{ __html: docxContent }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
