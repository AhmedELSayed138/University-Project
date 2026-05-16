import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./config/db.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);

try {
  await pool.query("SELECT 1");
  app.listen(port, () => {
    console.log(`Smart Clinic API running on http://localhost:${port}`);
  });
} catch (error) {
  console.error("Database connection failed:", error.message);
  process.exit(1);
}
