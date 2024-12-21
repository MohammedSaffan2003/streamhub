// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ProfilePage from "./components/ProfilePage";
import VideoUploadPage from "./components/VideoUploadPage";
import ChatComponent from "./components/ChatComponent";
import VideoPage from "./components/VideoPage";
import LiveStream from "./components/live/LiveStream";
import { LiveProvider } from "./components/live/LiveContext";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Check token existence
  }, []);

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);

    // Disconnect socket if it exists
    if (window.socket) {
      window.socket.disconnect();
    }

    // Clear any other user-related state
    // Add any additional cleanup needed
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Navbar handleLogout={handleLogout} isAuthenticated={isAuthenticated} />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-video"
          element={
            <ProtectedRoute>
              <VideoUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:videoId"
          element={
            <ProtectedRoute>
              <VideoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/live"
          element={
            <ProtectedRoute>
              <LiveProvider>
                <LiveStream />
              </LiveProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
