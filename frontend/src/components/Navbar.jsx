// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Assuming we will create a separate CSS file for Navbar

const Navbar = ({ handleLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">My Video App</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/upload-video">Upload Video</Link>
        <Link to="/chat">Chat</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
