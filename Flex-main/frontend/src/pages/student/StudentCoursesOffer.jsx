import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import "./StudentCoursesOffer.css";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MAX_CREDIT_HOURS = 18;

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

const StudentCourseOffer = () => {
  const [courses, setCourses] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentCreditHours, setCurrentCreditHours] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie("token");
        if (!token) {
          toast.error("❌ Token not found, Please log in again");
          return;
        }

        const decoded = jwtDecode(token);
        const rollNo = decoded.rollNo;
        setStudentName(decoded.name || "Student");

        // const coursesRes = await fetch(
        //   `${import.meta.env.VITE_API_URL}/api/students/${rollNo}/courses-offered`,
        //   { method: "GET", credentials: "include" }
        // );
        // const coursesData = await coursesRes.json();
        // if (!coursesRes.ok) throw new Error(coursesData.message || "❌ Failed to fetch courses");
        // setCourses(coursesData);

// new function 
        // In StudentCourseOffer.jsx - replace the courses fetch block
const coursesRes = await fetch(
  `${import.meta.env.VITE_API_URL}/api/students/${rollNo}/courses-offered`,
  { method: "GET", credentials: "include" }
);
const coursesData = await coursesRes.json();

if (!coursesRes.ok) {
  // ✅ Show the actual backend message instead of generic error
  toast.error(coursesData.message || "❌ Failed to fetch courses");
  setLoading(false);
  return;
}
setCourses(coursesData);

// end
        const creditRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/students/${rollNo}/credit-hours`,
          { method: "GET", credentials: "include" }
        );
        const creditData = await creditRes.json();
        if (!creditRes.ok) throw new Error(creditData.message || "❌ Failed to fetch credit hours");
        setCurrentCreditHours(creditData.creditHours || 0);
      } catch (error) {
        toast.error("❌ Something went wrong while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegister = async (courseCode) => {
    try {
      const token = getCookie("token");
      const decoded = jwtDecode(token);
      const rollNo = decoded.rollNo;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/students/${rollNo}/courses/${courseCode}`,
        { method: "POST", credentials: "include" }
      );
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "✅ Course registered successfully");
      } else {
        toast.warning(data.message || "❌ Could not register for the course");
      }

      // Refresh credit hours
      const creditRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/students/${rollNo}/credit-hours`,
        { method: "GET", credentials: "include" }
      );
      const creditData = await creditRes.json();
      setCurrentCreditHours(creditData.creditHours || 0);
    } catch (error) {
      toast.error("❌ Failed to enroll in course");
    }
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="student-course-offer">
        <h1>{studentName}'s Offered Courses</h1>
        <Link to="/student-dashboard" className="back-button">
          Back to Dashboard
        </Link>

        <div className="progress-container">
          <div className="progress-bar-background">
            <div
              className="progress-bar"
              style={{
                width: `${Math.min((currentCreditHours / MAX_CREDIT_HOURS) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <p>{currentCreditHours} / {MAX_CREDIT_HOURS} Credit Hours</p>
        </div>

        {loading ? (
          <div className="shimmer-loader">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer-card" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <p>No courses available for registration.</p>
        ) : (
          <div className="courses-list">
            {courses.map((course) => (
              <div
                className="course-card"
                key={`${course.course_code}-${course.course_semester}`}
              >
                <h2>{course.course_code}</h2>
                <p><strong>{course.course_name}</strong></p>
                <p><strong>Department:</strong> {course.course_dep}</p>
                <p><strong>Credit Hours:</strong> {course.credit_hr}</p>
                <p><strong>Course Type:</strong> {course.course_type}</p>
                <p><strong>Semester:</strong> {course.course_semester}</p>
                <p><strong>Section:</strong> {course.section_id}</p>
                <p><strong>Seats Available:</strong> {course.available_seats}</p>
                <button
                  className="register-button"
                  onClick={() => handleRegister(course.course_code)}
                >
                  Register
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentCourseOffer;