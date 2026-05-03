import React, { useState } from "react";
import axios from "axios";
import "./AdminLogin.css";
import Layout from "../components/Layout.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    adminId: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admins/login`,
        formData,
        { withCredentials: true }
      );

      toast.success(res.data.message || "Login successful");
      setTimeout(() => {
        window.location.href = "/admin-dashboard";
      }, 1500); // Allow toast to show
    } catch (err) {
      console.error("Login failed", err);
      toast.error(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <Layout>
      <div className="login-container">
        <div className="login-box">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <input
                type="text"
                name="adminId"
                placeholder="Enter Admin ID"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
          </form>
          <div className="forgot-password">
            <a href="/admin-forgot-password">Forgot Password?</a>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    </Layout>
  );
};

export default AdminLogin;