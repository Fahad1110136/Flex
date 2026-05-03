const { pool } = require("mssql");
const { sql, poolPromise } = require("../config/db");

const getInstructorbyID = async (instructorId) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Char(9), instructorId)
      .output("email", sql.VarChar(50))
      .output("name", sql.VarChar(50))
      .output("password", sql.VarChar(255))
      .output("status", sql.Bit)
      .execute("GET_INSTRUCTOR_DETAILS");

    const { email, name, password, status } = result.output;

    if (status) {
      return { id: instructorId, email, name, password };
    } else {
      return { message: "❌ Instructor not found" };
    }
  } catch (error) {
    console.error("❌ Error fetching instructor:", error);
    return { message: "❌ Internal server error" };
  }
};

const getRegisteredStudents = async (instructorId, courseCode, sectionId) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("instructorId", sql.Char(9), instructorId)
      .input("courseCode", sql.VarChar(9), courseCode)
      .input("sectionId", sql.Char(1), sectionId)
      .execute("GET_REGISTERED_STUDENTS");
      return result.recordset;
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    return { message: "❌ Internal server error" };
  }
};

const getTeachingAssistants = async (instructorId, courseCode, sectionId) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("instructorId", sql.Char(9), instructorId)
      .input("courseCode", sql.VarChar(9), courseCode)
      .input("sectionId", sql.Char(9), sectionId)
      .execute("GET_TEACHER_ASSISTANTS");

    return result.recordset;
  } catch (error) {
    console.error("❌ Error executing GET_TEACHER_ASSISTANTS:", error);
    return { message: "❌ Internal server error" };
  }
};

const getCoursesByInstructorId = async (instructorId) => {
  try {
    const pool = await poolPromise;

    const courses = await pool
      .request()
      .input("instructorId", sql.Char(9), instructorId)
      .execute("GET_COURSES_TEACHING");

    return courses.recordset.length > 0
      ? courses.recordset
      : { message: "❌ No courses found or unauthorized access" };
  } catch (error) {
    console.error("❌ Error fetching instructor's courses:", error);
    return { message: "❌ Internal server error" };
  }
};

const updatePassword = async (id, newPassword) => {
  const pool = await poolPromise;
  await pool
    .request()
    .input("id", sql.Char(9), id)
    .input("password", sql.VarChar(255), newPassword)
    .query("UPDATE Instructors SET password = @password WHERE id = @id");
};

module.exports = {
  getInstructorbyID,
  getRegisteredStudents,
  getTeachingAssistants,
  getCoursesByInstructorId,
  updatePassword
};