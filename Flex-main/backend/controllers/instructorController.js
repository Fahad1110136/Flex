const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const instructorModel = require("../models/instructorModel");

const fetchRegisteredStudents = async (req, res) => {

  const { instructorId, courseCode, sectionId } = req.params;

  const students = await instructorModel.getRegisteredStudents(instructorId, courseCode, sectionId);

  if (!Array.isArray(students)) {
    return res.status(500).json(students);
  }

  return res.status(200).json(students);
};

const fetchTeachingAssistants = async (req, res) => {
  const { instructorId, courseCode, sectionId } = req.params;

  const tas = await instructorModel.getTeachingAssistants(instructorId, courseCode, sectionId);
  res.status(tas.message ? 404 : 200).json(tas);
};


async function getInstructorCourses(req, res) {
  try {
    // read token from cookie (not authorization header)
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "❌ Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const instructorId = decoded.id;

    // check if URL instructorId matches the one from token
    if (instructorId !== req.params.instructorId) {
      return res.status(403).json({ message: "❌ Forbidden: You are not allowed to access these courses" });
    }

    const courses = await instructorModel.getCoursesByInstructorId(instructorId);
    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching instructor courses:", error);
    res.status(500).json({ message: "❌ Failed to fetch instructor courses", error: error.message || error });
  }
}

const fetchInstructorLogin = async (req, res) => {
  const { instructorId, password } = req.body;

  const instructor = await instructorModel.getInstructorbyID(instructorId);

  if (!instructor || instructor.message) {
    return res.status(404).json({ message: "❌ Instructor not found" });
  }

  const passwordMatch = await bcrypt.compare(password, instructor.password);
  if (!passwordMatch) {
    return res.status(400).json({ message: "❌ Invalid credentials" });
  }

  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { id: instructorId, role: "instructor", name: instructor.name },
    process.env.JWT_SECRET,
    { expiresIn: "20m" }
  );

  res.cookie("token", token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 20 * 60 * 1000,
  });

  res.status(200).json({ message: "✅ Login successful", instructor, token });

};

const changePassword = async (req, res) => {
  const instructorId = req.user.id;
  const { newPassword } = req.body;

  try {
    const instructor = await instructorModel.getInstructorbyID(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: "❌ Instructor not found" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await instructorModel.updatePassword(instructorId, hashed);

    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    console.error("❌ Password change error:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
};

module.exports = {
  fetchRegisteredStudents,
  fetchTeachingAssistants,
  getInstructorCourses,
  fetchInstructorLogin,
  changePassword
};