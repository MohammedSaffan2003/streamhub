import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/ArticleCard.css";

const ArticleCard = ({ article, onLike }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/articles/${article._id}`);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLike(article._id);
  };

  return (
    <div className="article-card" onClick={handleClick}>
      {article.thumbnailUrl && (
        <div className="article-thumbnail">
          <img src={article.thumbnailUrl} alt={article.title} />
        </div>
      )}

      <div className="article-content">
        <h3 className="article-title">{article.title}</h3>
        <p className="article-description">{article.description}</p>

        <div className="article-footer">
          <div className="article-meta">
            <span className="article-author">By {article.userId.username}</span>
            <span className="article-date">
              {new Date(article.createdAt).toLocaleDateString()}
            </span>
          </div>

          <button className="like-button" onClick={handleLikeClick}>
            ❤️ {article.likes.length}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
