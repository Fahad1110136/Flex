import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "./UpdateStudent.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const UpdateStudent = () => {
  const [formData, setFormData] = useState({
    rollNo: "",
    name: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rollNo || !formData.name) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admins/update-student`,
        formData,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setFormData({ rollNo: "", name: "" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update student"
      );
    }
  };

  return (
    <Layout>
      <div className="update-student-container">
        <div className="update-student-box">
          <h2>Update Student Information</h2>
          <form onSubmit={handleSubmit} className="update-student-form">
            <input
              type="text"
              name="rollNo"
              placeholder="Roll Number (e.g. 21K-1234)"
              value={formData.rollNo}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Student Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <button type="submit" className="update-button">
  Update
</button>
<button
  type="button"
  className="back-button-admin"
  onClick={() => navigate("/admin-dashboard")}
>
Back
</button>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateStudent;