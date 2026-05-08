const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const studentModel = require("../models/studentModel");
const sendResetEmail = require("../utils/emailService");

async function registerStudent(req, res) {
    const { name, rollNo, email, password } = req.body;

    try {
        if (rollNo.length !== 8) {
            return res.status(400).json({ message: "❌ Roll number must be exactly 8 characters long" });
        }

        const existingStudent = await studentModel.getStudentByRollNo(rollNo);
        if (existingStudent) {
            return res.status(400).json({ message: "❌ Student with this roll number already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await studentModel.createStudent(name, rollNo, email, hashedPassword);

        res.json({ message: "✅ Registration successful" });
    } catch (error) {
        res.status(500).json({ message: "❌ Registration failed", error });
    }
}

async function loginStudent(req, res) {
  const { rollNo, password } = req.body;
  try {
      const student = await studentModel.getStudentByRollNo(rollNo);
      if (!student) {
          return res.status(404).json({ message: "❌ Student not found" });
      }
      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) {
          return res.status(400).json({ message: "❌ Invalid credentials" });
      }
      const token = jwt.sign(
          { rollNo: rollNo, role: 'student', name: student.name,  currentSemester: student.currentSemester },
          process.env.JWT_SECRET,
          { expiresIn: "20m" }
      );
      res.cookie("token", token, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 20 * 60 * 1000
      });

      res.json({ message: "✅ Login successful", student });
  } catch (error) {
      console.error("❌ Login failed", error);
      res.status(500).json({ message: "❌ Login failed", error: error.message });
  }
}

async function forgotPassword(req, res) {
    const { rollNo } = req.body;
    try {
        const student = await studentModel.getStudentByRollNo(rollNo);
        
        if (!student) {
            return res.status(404).json({ message: "❌ Student not found" });
        }

        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        await studentModel.updatePassword(rollNo, hashedPassword);

        res.json({ 
            message: "✅ Password reset successfullly", 
            tempPassword: tempPassword // This is the key change
        });
    } catch (error) {
        console.error("❌ Password reset error:", error);
        res.status(500).json({ message: "❌ Password reset failed", error: error.message });
    }
}

async function changePassword(req, res) {
    const { newPassword } = req.body;
    const rollNo = req.user?.rollNo;
  
    try {
      if (!rollNo) {
        return res.status(401).json({ message: "❌ Unauthorized: Roll number missing in token" });
      }
  
      const student = await studentModel.getStudentByRollNo(rollNo);
  
      if (!student) {
        return res.status(404).json({ message: "❌ Student not found" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await studentModel.updatePassword(rollNo, hashedPassword);
  
      res.json({ message: "✅ Password successfully changed" });
    } catch (error) {
      console.error("❌ Password change error:", error);
      res.status(500).json({ message: "❌ Failed to change password", error: error.message || error });
    }
  }
  
async function getStudentCourses(req, res) {
    try {
      const courses = await studentModel.getEnrolledCourses(req.params.rollNo);
      res.json(courses);
    } catch (error) {
      console.error("❌ Error fetching enrolled courses:", error);
      res.status(500).json({ message: "❌ Error fetching enrolled courses", error });
    }
  }

async function getCoursesOffered(req, res) {
    const { rollNo } = req.params;

    try {
        const registrationPeriod = await studentModel.getRegistrationPeriod();

        if (!registrationPeriod || !registrationPeriod.is_active) {
            return res.status(400).json({ message: "❌ Registration period is not active. Please try again later" });
        }

        const courses = await studentModel.getCoursesOffered(rollNo);
        if (courses.length === 0) {
            return res.status(404).json({ message: "❌ No courses are offered for the next semester" });
        }

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "❌ Error fetching offered courses", error: error.message });
    }
}

async function dropCourse(req, res) {
    try {
        const { rollNo, courseCode } = req.params;
        res.json(await studentModel.dropCourse(rollNo, courseCode)); 
    } catch (error) {
        console.error("❌ Error dropping course:", error);
        res.status(500).json({ message: "❌ Error dropping course" });
    }
}

async function enrollCourse(req, res) {
    try {
      const { rollNo, courseCode } = req.params;
      res.json(await studentModel.enrollCourse(rollNo, courseCode));
    } catch (error) {
      console.error("❌ Error enrolling course:", error);
      res.status(500).json({ message: "❌ Error enrolling in course" });
    }
  }
  

async function getStudentProfile(req, res) {
    try {
        const { rollNo } = req.params;
        const student = await studentModel.getStudentByRollNo(rollNo);
        if (!student) {
            return res.status(404).json({ message: "❌ Student not found" });
        }
        res.json({ name: student.name, email: student.email, rollNo: student.roll_no });
    } catch (error) {
        console.error("❌ Error fetching student profile:", error);
        res.status(500).json({ message: "❌ Error fetching student profile" });
    }
}

async function updateStudentProfile(req, res) {
    try {
        const { rollNo } = req.params;
        const { name, email } = req.body;

        const student = await studentModel.getStudentByRollNo(rollNo);
        if (!student) {
            return res.status(404).json({ message: "❌ Student not found" });
        }

        await studentModel.updateStudentProfile(rollNo, name, email);
        res.json({ message: "✅ Profile updated successfully" });
    } catch (error) {
        console.error("❌ Error updating profile:", error);
        res.status(500).json({ message: "❌ Error updating profile" });
    }
}

async function getCurrentCreditHours(req, res) {
    try {
      const { rollNo } = req.params;
      const creditHours = await studentModel.getCurrentCreditHours(rollNo);
      res.json({ creditHours });
    } catch (error) {
      console.error("❌ Error fetching current credit hours:", error);
      res.status(500).json({ message: "❌ Error fetching current credit hours", error: error.message });
    }
  } 

module.exports = {
    registerStudent,
    loginStudent,
    forgotPassword,
    getStudentCourses,
    getCoursesOffered,
    dropCourse,
    enrollCourse,
    getStudentProfile,
    updateStudentProfile,
    getCurrentCreditHours,
    changePassword
};