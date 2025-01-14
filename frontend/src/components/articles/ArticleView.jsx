import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/ArticleView.css';

const ArticleView = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

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
      
      // Check if current user has liked the article
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      setIsLiked(data.likes.some(like => like._id === userId));
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/articles/${id}/like`,
        {
          method: 'POST',
          headers: {
            'x-auth-token': token,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to like article');
      const data = await response.json();
      setIsLiked(data.liked);
      // Update the article with new likes count
      setArticle(prev => ({
        ...prev,
        likes: data.likes
      }));
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/articles/${id}/comment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ text: comment }),
        }
      );
      
      if (!response.ok) throw new Error('Failed to post comment');
      
      setComment('');
      await fetchArticle(); // Refresh article data
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading article...</div>;
  }

  if (!article) {
    return <div className="error">Article not found</div>;
  }

  return (
    <div className="article-view">
      <button className="back-button" onClick={() => navigate('/articles')}>
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
          <span className="author">By {article.author?.name || article.author?.username || 'Anonymous'}</span>
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

        <div className="article-actions">
          <button 
            className={`like-button ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            {isLiked ? '❤️' : '🤍'} {article.likes.length} Likes
          </button>
        </div>

        <div className="comments-section">
          <h3>Comments</h3>
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <button type="submit">Post</button>
          </form>

          <div className="comments-list">
            {article.comments.map((comment, index) => (
              <div key={index} className="comment">
                <div className="comment-header">
                  <strong>{comment.user?.name || comment.user?.username || 'Anonymous'}</strong>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleView; 