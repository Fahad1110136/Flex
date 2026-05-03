import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
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

const AdminDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const [adminName, setAdminName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAdminName(decoded.name || "Admin");
      } catch (error) {
        console.error("Token decode failed:", error);
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
      navigate("/admin-login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Layout>
      <div className="admin-dashboard">
        <h1>Administration Dashboard</h1>
        <p>Welcome, {adminName || "Admin"}! Manage the platform efficiently.</p>

        <div className="dashboard-cards">
          <Link
            to="/update-student"
            className={`dashboard-card ${animate ? "dashboard-card-animated animate-delay-1" : ""}`}
          >
            <h2>🎓 Update Student</h2>
            <p>Modify student details and manage enrollment.</p>
          </Link>

          <Link
            to="/update-instructor"
            className={`dashboard-card ${animate ? "dashboard-card-animated animate-delay-2" : ""}`}
          >
            <h2>🧑‍🏫 Update Teacher</h2>
            <p>Edit instructor profiles and permissions.</p>
          </Link>

          <Link
            to="/add-course"
            className={`dashboard-card ${animate ? "dashboard-card-animated animate-delay-3" : ""}`}
          >
            <h2>📚 Add Course</h2>
            <p>Introduce new courses to the system.</p>
          </Link>

          <Link
            to="/registration"
            className={`dashboard-card ${animate ? "dashboard-card-animated animate-delay-4" : ""}`}
          >
            <h2>📝 Start Registration</h2>
            <p>Open registration for upcoming semesters.</p>
          </Link>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </Layout>
  );
};

export default AdminDashboard;