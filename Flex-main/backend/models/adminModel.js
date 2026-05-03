const { sql, poolPromise } = require("../config/db");

const adminModel = {

    getAdminById: async (adminId) => {
        try {
          const pool = await poolPromise;
          const result = await pool.request()
            .input("adminId", sql.Char(9), adminId)
            .query("SELECT admin_id, password, name FROM Admin WHERE admin_id = @adminId");
      
          return result.recordset[0];
        } catch (err) {
          console.error("❌ Database error in getAdminById:", err);
          throw err;
        }
      },
      
      updateStudent: async (rollNo, name) => {
        try {
            const pool = await poolPromise;
            const result = await pool
            .request()
            .input("rollNo", sql.Char(8), rollNo)
            .input("name", sql.VarChar(50), name)
            .execute("UPDATE_STUDENTS");
      
          return { success: true, rowsAffected: result.rowsAffected };
        } catch (err) {
          console.error("❌ Error in updateStudent:", err);
          throw err;
        }
      },
     updateInstructor: async (id, name) => {
        try {
          const pool = await poolPromise;
          const result = await pool
            .request()
            .input("id", sql.Char(9), id)
            .input("name", sql.VarChar(50), name)
            .execute("UPDATE_INSTRUCTOR");
      
          return result;
        } catch (err) {
          throw err;
        }
      },

      addCourse : async (courseCode, courseName, courseDep, creditHr, courseType, courseSemester) => {
        try {
          const pool = await poolPromise;
      
          const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM Courses 
            WHERE course_code = @courseCode
            `;
          const checkResult = await pool.request()
            .input("courseCode", sql.VarChar, courseCode)
            .query(checkQuery);
      
          if (checkResult.recordset[0].count > 0) {
            const error = new Error("❌ Course already exists");
            error.statusCode = 409; // conflict
            throw error;
          }
      
          // proceed with inserting the new course
          await pool.request()
            .input("courseCode", sql.VarChar, courseCode)
            .input("courseName", sql.VarChar, courseName)
            .input("courseDep", sql.VarChar, courseDep)
            .input("creditHr", sql.Int, creditHr)
            .input("courseType", sql.VarChar, courseType)
            .input("courseSemester", sql.VarChar, courseSemester)
            .execute("ADD_COURSE");
      
        } catch (err) {
          throw err;
        }
      },
      startRegistration : async () => {
        const pool = await poolPromise;
        return pool.request().execute('START_REGISTRATION');
      },
      stopRegistration : async () => {
        const pool = await poolPromise;
        return pool.request().execute('STOP_REGISTRATION');
      }
};

module.exports = adminModel;