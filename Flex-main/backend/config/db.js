const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: { encrypt: true, trustServerCertificate: true },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

async function connectDB() {
  try {
    const pool = await new sql.ConnectionPool(config).connect();
    console.log("✅ Connected to SQL Server Sucessfully");
    return pool;
  } catch (err) {
    console.error("❌ Database Connection Failed:", err);
    process.exit(1); // stop the server if DB connection fails
  }
}

// initialize connection once
poolPromise = connectDB();
module.exports = { sql, poolPromise };