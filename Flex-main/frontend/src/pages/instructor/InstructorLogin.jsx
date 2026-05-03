import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // import toast
import "react-toastify/dist/ReactToastify.css"; // import toast styles
import "./InstructorLogin.css"; 
import Layout from "../components/Layout.jsx";

const InstructorLogin = () => {
  const [formData, setFormData] = useState({
    instructorId: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/instructors/login`,
        formData,
        { withCredentials: true }
      );

      toast.success(res.data.message || "Login successful");

      setTimeout(() => {
        navigate("/instructor-dashboard");
      }, 1000); 
    } catch (err) {
      console.error("Login failed", err);
      toast.error("Error: " + (err.response?.data?.message || "Invalid credentials"));
    }
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="login-container">
        <div className="login-box">
          <h2>Instructor Login</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <input
                type="text"
                name="instructorId"
                placeholder="Enter Instructor ID"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Enter your Password"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
          </form>
          <div className="forgot-password">
            <a href="/instructor-forgot-password">Forgot Password?</a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InstructorLogin;