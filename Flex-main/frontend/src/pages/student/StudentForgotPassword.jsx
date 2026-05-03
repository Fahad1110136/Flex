import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "./StudentForgotPassword.css"; 

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    rollNo: "",
    email: "",
  });
  const [loading, setLoading] = useState(false); 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/students/forgot-password`,
        formData
      );
      alert(res.data.message);
    } catch (err) {
      console.error("Error:", err);
      alert("Error: " + err.response?.data?.message || "Password reset failed");
    }
    setLoading(false); 
  };
  
  return (
    <Layout> {/* wrap your content with layout to include Navbar */}
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <h2>Forgot Password</h2>
          <form className="forgot-password-form" onSubmit={handleReset}>
            <div className="input-group">
              <input
                type="text"
                name="rollNo"
                placeholder="Enter your Roll No"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Enter your Email"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="forgot-password-btn" disabled={loading}>
              {loading ? "Processing..." : "Reset Password"}
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