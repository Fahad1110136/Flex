import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdatePassword.css";
import Layout from "../components/Layout"; // import Layout

const PasswordChange = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/instructors/change-password`,
        { newPassword },
        { withCredentials: true }
      );
      setMessage("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <Layout> {/* wrap the content with layout */}
      <div className="change-password-container">
        <form className="change-password-form" onSubmit={handleSubmit}>
          <h2>Change Password</h2>
          {message && <p className="status-message">{message}</p>}
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="submit-button">Update Password</button>
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </form>
      </div>
    </Layout> // closing layout tag
  );
};

export default PasswordChange;