import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./StudentCourses.css";

const getCookie = (name) => {
  const cookieArray = document.cookie.split("; ");
  for (let i = 0; i < cookieArray.length; i++) {
    const [cookieName, cookieValue] = cookieArray[i].split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [studentCurrentSemester, setStudentCurrentSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = getCookie("token");
        const decoded = jwtDecode(token);
        const rollNo = decoded.rollNo;
        setStudentName(decoded.name || "Student");
        setStudentCurrentSemester(decoded.currentSemester);

        const url = `${import.meta.env.VITE_API_URL}/api/students/${rollNo}/courses`;
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || " ❌ Failed to fetch courses");

        setCourses(data);
      } catch (error) {
        setErrorMessage("❌ Something went wrong while fetching courses");
        toast.error("❌ " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const confirmDropToast = (course) => {
    const toastId = toast.info(
      <div className="toast-message">
        <p className="toast-message">Drop <strong>{course.course_code}</strong>?</p>
        <div style={{ marginTop: "8px" }}>
          <button
            onClick={async () => {
              toast.dismiss(toastId);
              await dropCourse(course);
            }}
            style={{
              marginRight: "10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      }
    );
  };
  
  const dropCourse = async (course) => {
    try {
      const token = getCookie("token");
      const decoded = jwtDecode(token);
      const rollNo = decoded.rollNo;

      const url = `${import.meta.env.VITE_API_URL}/api/students/${rollNo}/drop-course/${course.course_code}`;
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("❌ Invalid response from server");
      }

      if (!response.ok) throw new Error(result.message);

      setCourses((prev) =>
        prev.filter(
          (c) =>
            !(c.course_code === course.course_code && c.section_id === course.section_id)
        )
      );

      toast.success(`✅ Dropped ${course.course_code} successfully`);
    } catch (error) {
      toast.error(`❌ Failed to drop course: ${error.message}`);
    }
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="student-courses">
        <h1>{studentName}'s Enrolled Courses</h1>
        <Link to="/student-dashboard" className="back-button">
          Back to Dashboard
        </Link>

        {loading ? (
          <div className="shimmer-loader">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer-card" />
            ))}
          </div>
        ) : errorMessage ? (
          <p className="error">{errorMessage}</p>
        ) : courses.length === 0 ? (
          <p>You are not enrolled in any courses.</p>
        ) : (
          <div className="courses-list">
            {courses.map((course) => {
              const isCurrentSemester = `${course.semester}`.trim() === `${studentCurrentSemester}`.trim();

              return (
                <div
                  className="course-card"
                  key={`${course.course_code}-${course.section_id?.trim() || "N/A"}`}
                >
                  <h2>
                    {course.course_code} <br /> {course.course_name}
                  </h2>
                  <p><strong>Department:</strong> {course.course_dep}</p>
                  <p><strong>Credit Hours:</strong> {course.credit_hr}</p>
                  <p><strong>Course Type:</strong> {course.course_type}</p>
                  <p><strong>Semester:</strong> {course.semester}</p>

                  {isCurrentSemester && (
                    <button
                      className="drop-button"
                      onClick={() => confirmDropToast(course)}
                    >
                      Drop
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentCourses;