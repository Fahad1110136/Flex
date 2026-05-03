import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";  // import toast
import "react-toastify/dist/ReactToastify.css";  // import the styles
import "./StudentLogin.css";
import Layout from "../components/Layout.jsx";

const Login = () => {
  const [formData, setFormData] = useState({
    rollNo: "",
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
        `${import.meta.env.VITE_API_URL}/api/students/login`,
        formData,
        { withCredentials: true }
      );
      
      // ensure that res.data.message exists
      console.log(res.data.message);  // log the message to check

      // replace alert with toast
      toast.success(res.data.message); // success toast

      // add a delay before navigating
      setTimeout(() => {
        navigate("/student-dashboard");
      }, 1000); 
    } catch (err) {
      console.error("Login failed", err);
      
      // replace alert with error toast
      toast.error("Error: " + (err.response?.data?.error || "Invalid credentials")); // error toast
    }
  };

  return (
    <Layout>
      {/* make sure toastcontainer is in the right place */}
      <ToastContainer position="top-right" autoClose={3000} />  {/* toastcontainer for toast notifications */}
      
      <div className="login-container">
        <div className="login-box">
          <h2>Student Login</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <input
                type="text"
                name="rollNo"
                placeholder="Enter your Roll Number"
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
            <a href="/student-forgot-password">Forgot Password?</a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;