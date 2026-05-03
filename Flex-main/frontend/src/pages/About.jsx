import React from "react";
import "./About.css";
import Layout from "./components/Layout.jsx";

const About = () => {
  return (
    <Layout>
      <div className="about-container">
        <div className="about-header">
          <h1>About Flex</h1>
          <p className="tagline">Smarter, Faster, Simpler Course Registration System</p>
        </div>

        <div className="about-description">
          <p>
            Flex is your go-to platform for efficient course registration - no more long queues,
            chaotic spreadsheets, or last-minute panic enrollments. Whether you're a student,
            instructor, or admin, we've built this with you in mind.
          </p>
          <p>
            With a clean interface, secure architecture, and blazing-fast performance,
            Flex makes selecting and managing courses feel less like a chore and more like... well, slightly less of a chore.
          </p>
        </div>

        <div className="team-section">
          <h2>Meet the Creators</h2>
          <div className="team-cards">
            <div className="team-member">
              <h3>Fahad</h3>
              <p>Backend & Authentication Flow - helps keep your data protected and secure (for the most part).</p>
            </div>
            <div className="team-member">
              <h3>Zain</h3>
              <p>Frontend & UI Designing - transforming wireframes into stunning designs.</p>
            </div>
            <div className="team-member">
              <h3>Shaheer</h3>
              <p>Database & API Integration - fluent in SQL and knows how to communicate seamlessly with servers.</p>
            </div>
          </div>
          <p className="team-credit">
            This project is proudly crafted by <strong>ColdBlooded</strong> — driven by collaboration, determination, and a touch of AI assistance.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;