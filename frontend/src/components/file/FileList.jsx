import React, { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import FileCard from "./FileCard";
import "./styles/FileList.css";

const FileList = forwardRef((props, ref) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const refreshFiles = async () => {
    setFiles([]);
    setPage(1);
    setLoading(true);
    await fetchFiles();
  };

  useEffect(() => {
    refreshFiles();
  }, []);

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
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    refreshFiles();
  };

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/files/delete-file/${fileId}`,
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );
      await refreshFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  React.useImperativeHandle(ref, () => ({
    refreshFiles,
  }));

  return (
    <div className="file-list">
      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <button
          type="submit"
          className="search-button"
          id="search-button"
          disabled={loading}
        >
          <span>🔍</span> {loading ? "Searching..." : "Search"}
        </button>
      </form>

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
});

export default FileList;
