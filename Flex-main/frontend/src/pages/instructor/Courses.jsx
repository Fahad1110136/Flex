import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [instructorName, setInstructorName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = getCookie("token");
        if (!token) {
          toast.error("No token found, Please log in again");
          return;
        }

        const decoded = jwtDecode(token);
        const instructorId = decoded.id;
        const name = decoded.name || decoded.username || "Instructor";
        setInstructorName(name);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/instructors/${instructorId}/courses`,
          { withCredentials: true }
        );

        setCourses(response.data);
      } catch (error) {
        toast.error("Failed to fetch courses, Please try again");
      }
    };

    fetchCourses();
  }, []);

  const handleViewStudents = (courseCode, sectionId) => {
    navigate(`/instructor-courses/${courseCode}/${sectionId}/students`);
  };

  const handleViewTAs = (courseCode, sectionId) => {
    navigate(`/instructor-courses/${courseCode}/${sectionId}/tas`);
  };

  const handleBackToDashboard = () => {
    navigate("/instructor-dashboard");
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="courses-container courses-page">
        <div className="courses-box">
          <h1 className="courses-heading">
            {instructorName ? `${instructorName}'s Courses` : "My Courses"}
          </h1>

          <button onClick={handleBackToDashboard} className="back-button">
            Back to Dashboard
          </button>

          {courses.length === 0 ? (
            <div className="no-courses-message">
              <p>No courses found.</p>
            </div>
          ) : (
            <div className="courses-list">
              {courses.map((course) => (
                <div
                  key={`${course.course_code}-${course.section_id}`}
                  className="course-card"
                >
                  <h2 className="course-title">{course.course_name}</h2>
                  <p className="course-code">
                    Course Code: {course.course_code}
                  </p>
                  <p className="course-section">
                    Section: {course.section_id}
                  </p>

                  <div className="button-group">
                    <button
                      onClick={() =>
                        handleViewStudents(
                          course.course_code,
                          course.section_id
                        )
                      }
                      className="view-button view-students"
                    >
                      View Students
                    </button>

                    <button
                      onClick={() =>
                        handleViewTAs(course.course_code, course.section_id)
                      }
                      className="view-button view-tas"
                    >
                      View TAs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

function getCookie(name) {
  const cookieArr = document.cookie.split("; ");
  for (const cookie of cookieArr) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

export default Courses;