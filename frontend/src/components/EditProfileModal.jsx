import React, { useState } from "react";
import axios from "axios";
import "./EditProfileModal.css";

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/user/update",
        {
          username,
          email,
          currentPassword,
          newPassword,
        },
        {
          headers: { "x-auth-token": token },
        }
      );

      onUpdate(response.data);
      onClose();
    } catch (error) {
      setError(error.response?.data || "Error updating profile");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter to verify changes"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password (Optional)</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
