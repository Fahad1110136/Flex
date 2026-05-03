import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./StudentChangePassword.css";
import Layout from "../components/Layout.jsx";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("❌ New passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/students/change-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Password changed successfully");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(`${data.error || "❌ Password change failed"}`);
      }
    } catch (error) {
      console.error("❌ Password change error:", error);
      setMessage("❌ Server error, Please try again later");
    }
  };

  return (
    <Layout>
      <div className="change-password-container">
        <h2>Change Password</h2>

        {/* 🔙 Back to Dashboard */}
        <Link to="/student-dashboard" className="back-button">
          Back to Dashboard
        </Link>

        <form className="change-password-form" onSubmit={handleSubmit}>
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
          <button type="submit">Update Password</button>
        </form>
        {message && <p className="status-message">{message}</p>}
      </div>
    </Layout>
  );
};

export default ChangePassword;