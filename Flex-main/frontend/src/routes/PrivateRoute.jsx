import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const PrivateRoute = ({ children }) => {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/api/auth-check`, {
          withCredentials: true,
        });
        setAuthorized(true);
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Authentication check failed:", error);
        }
        setAuthorized(false);
      }
    };
  
    checkAuth();
  }, []);
  
  if (authorized === null) return <div>Loading...</div>;
  if (!authorized) return <Navigate to="/" replace />;

  return children;
};

export default PrivateRoute;