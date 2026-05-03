import React, { useState, useEffect } from "react";
import "./AddCourse.css";
import Layout from "../components/Layout.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // import toast
import 'react-toastify/dist/ReactToastify.css'; // import the toast styles

const AddCourse = () => {
  const [animate, setAnimate] = useState(false);
  const [courseData, setCourseData] = useState({
    courseCode: "",
    courseName: "",
    courseDep: "",
    creditHr: "",
    courseType: "",
    courseSemester: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admins/add-course",
        courseData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        toast.success("Course added successfully"); // show success toast
      } else {
        toast.error("Failed to add course"); // show error toast
      }
    } catch (err) {
      console.error("Error adding course:", err);
      toast.error("An error occurred while adding the course"); // show error toast
    }
  };

  const handleBack = () => {
    navigate("/admin-dashboard"); // navigate back to admin dashboard or another page
  };

  return (
    <Layout>
      <div className={`add-course-container ${animate ? "fade-in" : ""}`}>
        <h1>Add New Course</h1>
        <form className="course-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="courseCode"
            placeholder="Course Code (e.g. CS101)"
            value={courseData.courseCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="courseName"
            placeholder="Course Name"
            value={courseData.courseName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="courseDep"
            placeholder="Department (e.g. Computer Science)"
            value={courseData.courseDep}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="creditHr"
            placeholder="Credit Hours"
            value={courseData.creditHr}
            onChange={handleChange}
            required
          />
          <select
            name="courseType"
            value={courseData.courseType}
            onChange={handleChange}
            required
          >
            <option value="">Select Course Type</option>
            <option value="Core">Core</option>
            <option value="Elective">Elective</option>
          </select>
          <input
            type="number"
            name="courseSemester"
            placeholder="Semester (e.g. 5)"
            value={courseData.courseSemester}
            onChange={handleChange}
            required
          />
          <button type="submit">Add Course</button>
        </form>
        <button onClick={handleBack} className="back-button">Back</button> {/* Back button */}
      </div>
    </Layout>
  );
};

export default AddCourse;