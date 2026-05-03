const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// route to check if user is authenticated
router.get("/auth-check", verifyToken, (req, res) => {
  res.json({ message: "✅ Authenticated" });
});

// route to log out user and clear token cookie
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax", 
    secure: false, 
  });
  res.json({ message: "✅ Logged out and token cleared" });
});

module.exports = router;