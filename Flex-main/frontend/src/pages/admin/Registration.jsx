import React from 'react';
import './Registration.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admins/start-registration`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message || "Registration started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start registration");
    }
  };

  const handleStop = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admins/stop-registration`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message || "Registration stopped");
    } catch (error) {
      console.error(error);
      toast.error("Failed to stop registration");
    }
  };

  return (
    <div className="registration-container">
      <h2>Registration Control Panel</h2>

      <div className="button-group">
        <button onClick={handleStart} className="start-btn">Start Registration</button>
        <button onClick={handleStop} className="stop-btn">Stop Registration</button>
      </div>

      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="back-btn">Back</button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Registration;