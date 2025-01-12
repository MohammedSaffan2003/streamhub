import React, { useState, useEffect } from "react";
import axios from "axios";
import FileCard from "./FileCard";
import "./styles/FileList.css";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [page, searchQuery]);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token");
      }

      const response = await axios.get(
        `http://localhost:5000/api/files/list-files`,
        {
          params: {
            query: searchQuery,
            page: page,
          },
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const { files: newFiles, totalPages } = response.data;
      setFiles((prev) => (page === 1 ? newFiles : [...prev, ...newFiles]));
      setHasMore(page < totalPages);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/files/delete-file/${fileId}`,
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="file-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="file-grid">
        {files.map((file) => (
          <FileCard key={file._id} file={file} onDelete={handleDelete} />
        ))}
      </div>

      {loading && <div className="loading">Loading files...</div>}

      {hasMore && (
        <button className="load-more" onClick={loadMore} disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};

export default FileList;
