// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css"; // Assuming we will create a separate CSS file for Navbar

const Navbar = ({ handleLogout }) => {
  const navigate = useNavigate();

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
        <Link to="/chat">Chat</Link>
        <button onClick={handleLogoutClick}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
