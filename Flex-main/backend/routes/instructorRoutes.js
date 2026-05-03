const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/instructorController");
const { verifyToken, verifyRole } = require("../middleware/auth");

router.post("/login", instructorController.fetchInstructorLogin);

router.get("/:instructorId/students/:courseCode/:sectionId", verifyToken, verifyRole(['instructor']), instructorController.fetchRegisteredStudents);
router.get("/:instructorId/tas/:courseCode/:sectionId", verifyToken, verifyRole(['instructor']), instructorController.fetchTeachingAssistants);
router.get("/:instructorId/courses", verifyToken, verifyRole(['instructor']), instructorController.getInstructorCourses);
router.put("/change-password", verifyToken, verifyRole(['instructor']), instructorController.changePassword);

module.exports = router;