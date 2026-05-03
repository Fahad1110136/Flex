import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Layout from "../components/Layout";
import "./CourseTA.css";

const CourseTA = () => {
  const { courseCode, sectionId } = useParams();
  const [tas, setTAs] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // get instructorId from token
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  let instructorId = "";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      instructorId = decoded.id;
    } catch (err) {
      console.error("Failed to decode token", err);
    }
  }

  useEffect(() => {
    const fetchTAs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/instructors/${instructorId}/tas/${courseCode}/${sectionId}`,
          { withCredentials: true }
        );
        setTAs(response.data);
      } catch (err) {
        console.error("Failed to fetch TAs", err);
        setError("Failed to load teaching assistants");
      }
    };

    if (instructorId) {
      fetchTAs();
    } else {
      setError("Instructor not authenticated");
    }
  }, [courseCode, sectionId, instructorId]);

  const handleBack = () => {
    navigate(-1); // go back to previous page
  };

  return (
    <Layout>
      <div className="tas-container">
        <div className="tas-box">
          <h1 className="tas-heading">
            TA's for {courseCode} - Section {sectionId}
          </h1>

          <div className="back-button-container">
            <button className="back-button" onClick={handleBack}>
              Back
            </button>
          </div>

          {error && <p className="tas-error">{error}</p>}

          {tas.length === 0 ? (
            <p className="tas-empty">No TAs assigned to this section.</p>
          ) : (
            <div className="tas-list">
              {tas.map((ta, index) => (
  <div key={`${ta.ta_roll_no}-${index}`} className="ta-card">
    <h3 className="ta-name">{ta.ta_name}</h3>
    <p className="ta-email">{ta.ta_roll_no}</p>
  </div>
))}

            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseTA;