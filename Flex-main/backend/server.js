const express = require("express"); 
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const studentRoutes = require("./routes/studentRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/students", studentRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api", authRoutes); // Mount the auth-check route

// /////////////
// /**
//  * generate-hashes.js
//  * 
//  * Run this ONCE to print bcrypt hashes for your passwords.
//  * Paste this snippet temporarily at the top of your server.js,
//  * run `node server.js`, copy the hashes, then REMOVE this snippet.
//  *
//  * Usage: node generate-hashes.js
//  * Requires: npm install bcrypt
//  */

// const bcrypt = require('bcrypt');

// const SALT_ROUNDS = 10; // must match what your auth/login code uses

// const passwords = [
//   'instructor0001',
//   'instructor0002',
//   'instructor0003',
//   'instructor0004',
//   'instructor0005',
//   'instructor0006',
//   'instructor0007',
//   'instructor0008',
//   'instructor0009',
//   'instructor00010',
//   'instructor00011',
//   'instructor00012',
//   'instructor00013',
//   'instructor00014',
//   'instructor00015',
// ];

// (async () => {
//   console.log('\n=== BCRYPT HASHES (salt rounds:', SALT_ROUNDS, ') ===\n');

//   for (const password of passwords) {
//     const hash = await bcrypt.hash(password, SALT_ROUNDS);

//     // Immediately verify — if this prints false, do NOT use that hash
//     const valid = await bcrypt.compare(password, hash);

//     if (!valid) {
//       console.error(`❌ VERIFICATION FAILED for: ${password}`);
//       process.exit(1);
//     }

//     console.log(`Password : ${password}`);
//     console.log(`Hash     : ${hash}`);
//     console.log(`Verified : ${valid}`);
//     console.log('---');
//   }

//   console.log('\n✅ All hashes verified. Copy the Hash values into your database.\n');
// })();
// /////////////

// test route
app.get("/", (req, res) => res.send("🚀 Server is running!"));

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port: ${PORT}`));
