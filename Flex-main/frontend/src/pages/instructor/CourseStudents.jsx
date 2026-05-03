import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseStudents.css";
import { jwtDecode } from "jwt-decode";

const CourseStudents = () => {
  const { courseCode, sectionId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = getCookie("token");
        const decoded = jwtDecode(token);
        const instructorId = decoded.id;

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/instructors/${instructorId}/students/${courseCode}/${sectionId}`,
          { withCredentials: true }
        );

        if (response.data?.message) {
          setError(response.data.message);
        } else {
          const sortedStudents = response.data.sort((a, b) =>
            a.roll_no.localeCompare(b.roll_no)
          );
          setStudents(sortedStudents);
        }
      } catch (err) {
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseCode, sectionId]);

  return (
    <Layout>
      <div className="students-container">
        {/* Title */}
        <h2 className="students-heading">
          Students in {courseCode.toUpperCase()} - Section {sectionId}
        </h2>

        {/* Back Button Container */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <button
            className="back-button"
            onClick={() => navigate("/instructor-courses")}
          >
            Back to Courses
          </button>
        </div>

        {/* Table */}
        <div className="students-table">
          <div className="students-header">
            <div className="students-cell">Roll No</div>
            <div className="students-cell">Name</div>
          </div>
          {students.map((student) => (
  <div key={`${student.roll_no}-${courseCode}-${sectionId}`} className="students-row">
    <div className="students-cell">{student.roll_no}</div>
    <div className="students-cell">{student.name}</div>
  </div>
))}

        </div>

        {loading && <div className="students-loading">Loading...</div>}
        {error && <div className="students-error">{error}</div>}
      </div>
    </Layout>
  );
};

// helper to read cookie
function getCookie(name) {
  const cookieArr = document.cookie.split("; ");
  for (const cookie of cookieArr) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) return cookieValue;
  }
  return null;
}

export default CourseStudents;