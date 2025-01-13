import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/ArticleView.css';

const ArticleView = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/api/articles/${id}`,
          {
            headers: {
              'x-auth-token': token,
            },
          }
        );
        
        if (!response.ok) throw new Error('Article not found');
        
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading article...</div>;
  }

  if (!article) {
    return <div className="error">Article not found</div>;
  }

  return (
    <div className="article-view">
      <button 
        className="back-button"
        onClick={() => navigate('/articles')}
      >
        ← Back to Articles
      </button>

      <article className="article-content">
        {article.image && (
          <div className="article-hero">
            <img src={article.image} alt={article.title} />
          </div>
        )}

        <h1>{article.title}</h1>

        <div className="article-meta">
          <span className="author">By {article.author.name}</span>
          <span className="date">
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        <div 
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
};

export default ArticleView; 