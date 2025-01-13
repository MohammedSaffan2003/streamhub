import React, { useState, useEffect } from 'react';
import ArticleEditor from '../components/articles/ArticleEditor';
import ArticleCard from '../components/articles/ArticleCard';
import './styles/ArticlesPage.css';

const ArticlesPage = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/articles/list?page=${page}`,
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      const data = await response.json();
      
      setArticles(prev => 
        page === 1 ? data.articles : [...prev, ...data.articles]
      );
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const handlePublish = (newArticle) => {
    setArticles(prev => [newArticle, ...prev]);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="articles-page">
      <div className="articles-header">
        <h1>Articles</h1>
        <button 
          className="write-button"
          onClick={() => setShowEditor(true)}
        >
          Write Article
        </button>
      </div>

      {showEditor && (
        <div className="editor-modal-overlay">
          <div className="editor-modal">
            <ArticleEditor
              onClose={() => setShowEditor(false)}
              onPublish={handlePublish}
            />
          </div>
        </div>
      )}

      <div className="articles-grid">
        {articles.map(article => (
          <ArticleCard
            key={article._id}
            article={article}
          />
        ))}
      </div>

      {loading && <div className="loading">Loading articles...</div>}
      
      {hasMore && (
        <button 
          className="load-more-button"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default ArticlesPage; 