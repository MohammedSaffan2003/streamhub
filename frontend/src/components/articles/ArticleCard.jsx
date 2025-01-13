import React from 'react';
import { Link } from 'react-router-dom';
import './styles/ArticleCard.css';

const ArticleCard = ({ article }) => {
  const { _id, title, content, image, author, createdAt } = article;
  
  const truncateContent = (text, maxLength = 150) => {
    const strippedText = text.replace(/<[^>]+>/g, '');
    if (strippedText.length <= maxLength) return strippedText;
    return strippedText.substr(0, maxLength) + '...';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/articles/${_id}`} className="article-card">
      <div className="article-image">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="title-thumbnail">{title[0]}</div>
        )}
      </div>
      <div className="article-content">
        <h2>{title}</h2>
        <p className="article-excerpt">{truncateContent(content)}</p>
        <div className="article-meta">
          <span className="author">{author.name}</span>
          <span className="date">{formatDate(createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard; 