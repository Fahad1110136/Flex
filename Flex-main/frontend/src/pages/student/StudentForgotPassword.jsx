import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./StudentForgotPassword.css"; 

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    rollNo: "",
    email: "",
  });
  const [loading, setLoading] = useState(false); 
  const [newPassword, setNewPassword] = useState(""); // State to hold the password returned by the server

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNewPassword(""); // Clear previous password display
    
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/students/forgot-password`,
        formData
      );
      
      // If the backend sends the tempPassword in the JSON response
      if (res.data.tempPassword) {
        setNewPassword(res.data.tempPassword);
        toast.success("✅ Password reset successfully");
      } else {
        toast.success(res.data.message || "✅ Reset successful");
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMsg = err.response?.data?.message || "❌ Password reset failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false); 
    }
  };
  
  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          
          

          {/* This section only shows once the password has been generated */}
          {newPassword && (
            <div className="password-display-card">
              <p>Your temporary password is:</p>
              <div className="temp-password-badge">{newPassword}</div>
              <p className="password-note">
                Please copy this password and use it to log in. 
                Change it immediately after you log in.
              </p>
            </div>
          )}

          <form className="forgot-password-form" onSubmit={handleReset}>
            <div className="input-group">
              <label>Roll Number</label>
              <input
                type="text"
                name="rollNo"
                placeholder="e.g., 23L-0123"
                value={formData.rollNo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your registered email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="forgot-password-btn" disabled={loading}>
              {loading ? "Processing..." : "Generate New Password"}
            </button>
          </form>

          <div className="back-to-login">
            <a href="/student-login">Back to Login</a>

          </div>
        </div>
      </div>
    </Layout> 
  );
};

export default ForgotPassword;