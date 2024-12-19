// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Assuming we will create a separate CSS file for Navbar

const Navbar = ({ handleLogout, isAuthenticated }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">StreamHub</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/upload-video">Upload Video</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/live" className="go-live-button">
          Go Live
        </Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
