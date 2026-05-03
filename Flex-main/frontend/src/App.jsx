import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PrivateRoute from "./routes/PrivateRoute";

import Home from "./pages/Home";
import About from "./pages/About";

import StudentPortal from "./pages/student/StudentPortal";
import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import StudentForgotPassword from "./pages/student/StudentForgotPassword";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCoursesOffer from "./pages/student/StudentCoursesOffer";
import StudentChangePassword from "./pages/student/StudentChangePassword";

import InstructorLogin from "./pages/instructor/InstructorLogin";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorCourses from "./pages/instructor/Courses";
import CourseStudents from "./pages/instructor/CourseStudents";
import CourseTA from "./pages/instructor/CourseTA";
import UpdatePassword from "./pages/instructor/UpdatePassword";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UpdateStudent from "./pages/admin/UpdateStudent";
import UpdateInstructors from "./pages/admin/UpdateInstructors";
import AddCourse from "./pages/admin/AddCourse"
import Registration from "./pages/admin/Registration";

const App = () => {
  return (
    <>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route
          path="/student-forgot-password"
          element={<StudentForgotPassword />}
        />

        <Route path="/instructor-login" element={<InstructorLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* protected routes */}
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/student-courses"
          element={
            <PrivateRoute>
              <StudentCourses />
            </PrivateRoute>
          }
        />

        <Route
          path="/student-courses-offer"
          element={
            <PrivateRoute>
              <StudentCoursesOffer />
            </PrivateRoute>
          }
        />

        <Route
          path="/student-change-password"
          element={
            <PrivateRoute>
              <StudentChangePassword />
            </PrivateRoute>
          }
        />

        <Route
          path="/instructor-dashboard"
          element={
            <PrivateRoute>
              <InstructorDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/instructor-courses"
          element={
            <PrivateRoute>
              <InstructorCourses />
            </PrivateRoute>
          }
        />

        <Route
          path="/instructor-courses/:courseCode/:sectionId/students"
          element={
            <PrivateRoute>
              <CourseStudents />
            </PrivateRoute>
          }
        />

        <Route
          path="/instructor-courses/:courseCode/:sectionId/tas"
          element={
            <PrivateRoute>
              <CourseTA />
            </PrivateRoute>
          }
        />

        <Route
          path="/instructor-change-password"
          element={
            <PrivateRoute>
              <UpdatePassword />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/update-student"
          element={
            <PrivateRoute>
              <UpdateStudent />
            </PrivateRoute>
          }
        />

        <Route
          path="/update-instructor"
          element={
            <PrivateRoute>
              <UpdateInstructors />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-course"
          element={
            <PrivateRoute>
              <AddCourse />
            </PrivateRoute>
          }
        />

<Route
          path="/registration"
          element={
            <PrivateRoute>
              <Registration />
            </PrivateRoute>
          }
        />

      </Routes>
      
      {/* notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default App;