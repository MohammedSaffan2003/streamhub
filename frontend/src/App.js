import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import ChatComponent from "./components/ChatComponent";
import StoriesPage from "./pages/StoriesPage";
import { jwtDecode } from "jwt-decode";
import "./App.css";
import StoryView from "./components/story/StoryView";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {isAuthenticated && <Navbar handleLogout={handleLogout} />}
      <div className="app-container">
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/chat" />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <Register onRegister={handleLogin} />
              ) : (
                <Navigate to="/chat" />
              )
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? <ChatComponent /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/stories"
            element={
              isAuthenticated ? <StoriesPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/stories/:id"
            element={isAuthenticated ? <StoryView /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
