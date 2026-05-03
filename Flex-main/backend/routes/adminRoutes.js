const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, verifyRole } = require("../middleware/auth");

router.post("/login", adminController.fetchAdminLogin);

router.put(
  "/update-student",
  verifyToken,
  verifyRole(["admin"]),
  adminController.updateStudentController
);
router.put(
    "/update-instructor",
    verifyToken,
    verifyRole(["admin"]),
    adminController.updateInstructorController
  );
  router.post(
    "/add-course",
    verifyToken,
    verifyRole(["admin"]),
    adminController.addCourseController
  );

  router.post(
    "/start-registration",
    verifyToken,
    verifyRole(["admin"]),
    adminController.startRegistration
  );
  router.post(
    "/stop-registration",
    verifyToken,
    verifyRole(["admin"]),
    adminController.stopRegistration
  );
module.exports = router;