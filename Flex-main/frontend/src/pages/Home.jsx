// src/pages/Home.js
import { Link } from 'react-router-dom';
import React from "react";
import Layout from "./components/Layout.jsx";
import "./Home.css";

const Home = () => {
  return (
    <Layout>
      <div className="home">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>Welcome to <span className="highlight">Flex</span></h1>
            <p>A smooth and efficient course registration platform designed for students, instructors, and administrators.</p>
          </div>

          {/* buttons */}
          <div className="buttons">
            <Link to="/student-portal" className="btn student">🎓 Student Dashboard</Link>
            <Link to="/instructor-login" className="btn instructor">🏫 Instructor Dashboard</Link>
            <Link to="/admin-login" className="btn admin">⚙️ Administration Dashboard</Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
