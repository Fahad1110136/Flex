const adminModel = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// existing Admin login controller
const fetchAdminLogin = async (req, res) => {
  const { adminId, password } = req.body;

  try {
    const admin = await adminModel.getAdminById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "❌ Admin not found" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "❌ Invalid credentials" });
    }

    const token = jwt.sign(
      { id: adminId, role: "admin", name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "20m" }
    );

    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 20 * 60 * 1000,
    });

    res.status(200).json({ message: "✅ Login successful", admin, token });

  } catch (err) {
    console.error("❌ Admin login failed:", err);
    res.status(500).json({ message: "❌ Internal server error" });
  }
};

// controller for updating student information
const updateStudentController = async (req, res) => {
  const { rollNo, name } = req.body;

  if (!rollNo || !name) {
    return res.status(400).json({ message: "❌ Missing roll number or name" });
  }

  try {
    const result = await adminModel.updateStudent(rollNo, name);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "❌ Student not found" });
    }

    res.status(200).json({ message: "✅ Student updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to update student" });
  }
};

// controller for updating instructor information
const updateInstructorController = async (req, res) => {
  const { id, name } = req.body;

  if (!id || !name) {
    return res.status(400).json({ message: "❌ Missing ID or name" });
  }

  try {
    await adminModel.updateInstructor(id, name);
    res.status(200).json({ message: "✅ Instructor updated successfully" });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ message: "❌ Failed to update instructor" });
  }
};

// new add course controller
const addCourseController = async (req, res) => {
  const { courseCode, courseName, courseDep, creditHr, courseType, courseSemester } = req.body;

  // validate course data
  if (!courseCode || !courseName || !courseDep || !creditHr || !courseType || !courseSemester) {
    return res.status(400).json({ message: "❌ Missing course details" });
  }

  try {
    // assuming your model method 'addCourse' adds a course to the database
    await adminModel.addCourse(courseCode, courseName, courseDep, creditHr, courseType, courseSemester);
    res.status(201).json({ message: "✅ Course added successfully" });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ message: "❌ Course already exists" });
    }

    console.error("Add course failed:", err);
    res.status(500).json({ message: "❌ Failed to add course" });
  }
};

const startRegistration = async (req, res) => {
    try {
      await adminModel.startRegistration();
      res.status(200).json({ message: '✅ Registration started for 10 days' });
    } catch (error) {
      console.error('❌ Error starting registration:', error);
      res.status(500).json({ error: '❌ Internal server error' });
    }
  };

  const stopRegistration = async (req, res) => {
    try {
      await adminModel.stopRegistration();
      res.status(200).json({ message: '❌ Registration stopped' });
    } catch (error) {
      console.error('❌ Error stopping registration:', error);
      res.status(500).json({ error: '❌ Internal server error' });
    }
  };

module.exports = {
  fetchAdminLogin,
  updateStudentController,
  updateInstructorController,
  addCourseController,
  startRegistration,
  stopRegistration
};