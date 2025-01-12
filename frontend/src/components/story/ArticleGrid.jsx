import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/ArticleGrid.css";
import ArticleCard from "./ArticleCard";

const ArticleGrid = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/articles?page=${page}`,
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );

      const { articles: newArticles, totalPages } = response.data;

      setArticles((prev) =>
        page === 1 ? newArticles : [...prev, ...newArticles]
      );
      setHasMore(page < totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setLoading(false);
    }
  };

  const handleLike = async (articleId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/articles/${articleId}/like`,
        {},
        {
          headers: { "x-auth-token": localStorage.getItem("token") },
        }
      );

      setArticles((prev) =>
        prev.map((article) =>
          article._id === articleId
            ? { ...article, likes: response.data.likes }
            : article
        )
      );
    } catch (error) {
      console.error("Error liking article:", error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && page === 1) {
    return <div className="loading">Loading articles...</div>;
  }

  return (
    <div className="article-grid-container">
      <div className="article-grid">
        {articles.map((article) => (
          <ArticleCard
            key={article._id}
            article={article}
            onLike={handleLike}
          />
        ))}
      </div>

      {hasMore && (
        <button
          className="load-more-button"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};

export default ArticleGrid;
