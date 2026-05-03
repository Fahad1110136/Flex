import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "./UpdateInstructors.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UpdateInstructor = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admins/update-instructor`,
        formData,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setFormData({ id: "", name: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update instructor");
    }
  };

  return (
    <Layout>
      <div className="update-instructor-container">
        <div className="update-instructor-box">
          <h2>Update Instructor Information</h2>
          <form onSubmit={handleSubmit} className="update-instructor-form">
            <input
              type="text"
              name="id"
              placeholder="Instructor ID (e.g. I-0001)"
              value={formData.id}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Instructor Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <button type="submit" className="update-btn">Update</button>
            <button
              type="button"
              className="back-btn"
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

export default UpdateInstructor;