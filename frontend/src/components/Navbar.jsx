// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const Navbar = ({ handleLogout, isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogoutClick = async () => {
    try {
      const token = localStorage.getItem("token");
      // Call logout endpoint to update online status
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      // Then proceed with frontend logout
      handleLogout();
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still logout from frontend even if API call fails
      handleLogout();
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">StreamHub</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/upload-video">Upload Video</Link>
        <Link
          to="/chat"
          className={`nav-link ${isActive("/chat") ? "active" : ""}`}
        >
          Chat
        </Link>
        <Link
          to="/stories"
          className={`nav-link ${isActive("/stories") ? "active" : ""}`}
        >
          Stories
        </Link>
        <Link to="/live" className="go-live-button">
          Go Live
        </Link>
        <button onClick={handleLogoutClick}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
