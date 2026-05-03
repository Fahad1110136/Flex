import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "./RegisteredStudents.css"; 

const RegisteredStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/instructors/registered-students`,
          { withCredentials: true } // for cookie-based auth
        );

          { withCredentials: true } 
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load registered students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <Layout>
      <div className="registered-students-container">
        <h2>📋 Registered Students</h2>

        {loading ? (
          <p>Loading students...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.rollNo}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default RegisteredStudents;