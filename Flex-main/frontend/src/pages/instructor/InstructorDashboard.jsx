import React, { useEffect, useState } from "react";
import "./InstructorDashboard.css";
import Layout from "../components/Layout.jsx";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const getCookie = (name) => {
  const cookieArray = document.cookie.split("; ");
  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].split("=");
    if (cookie[0] === name) return cookie[1];
  }
  return null;
};

const InstructorDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const [instructorName, setInstructorName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setInstructorName(decodedToken.name || "Instructor");
      } catch (error) {
        console.error("Token decoding error:", error);
      }
    }

    const timeout = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/instructor-login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Layout>
      <div className="student-dashboard">
        <h1>Instructor Dashboard</h1>
        <p>
          Welcome, {instructorName || "Instructor"}! Manage your teaching
          responsibilities below.
        </p>

        <div className="dashboard-cards">
          <Link
            to="/instructor-courses"
            className={`dashboard-card ${animate ? "dashboard-card-animated animate-delay-1" : ""}`}
          >
            <h2>📚 Courses Taught</h2>
            <p>Browse courses you're currently teaching.</p>
          </Link>

          <Link
            to="/instructor-change-password"
            className={`dashboard-card ${animate ? "dashboard-card-animated animate-delay-2" : ""}`}
          >
            <h2>🔐 Update Password</h2>
            <p>Change your login password securely.</p>
          </Link>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </Layout>
  );
};

export default InstructorDashboard;