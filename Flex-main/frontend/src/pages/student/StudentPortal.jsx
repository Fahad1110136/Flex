import React from "react";
import { Link } from "react-router-dom"; // import Link for navigation
import './StudentPortal.css'; // import the CSS file for styling
import Layout from "../components/Layout.jsx";

const StudentPortal = () => {
  return (
    <Layout>
    <div className="student-portal">
      <h1>Welcome to the Student Portal</h1>
      <p>
        This is the student portal, where you can access your course registration details, assignments, and other resources.
      </p>
      <div className="student-portal-actions">
        {/* Navigation Links */}
        <Link to="/student-register" className="btn student-btn register-btn">
          Register
        </Link>
        <Link to="/student-login" className="btn student-btn login-btn">
          Login
        </Link>
      </div>
    </div>
    </Layout>
  );
};

export default StudentPortal;