// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import route files
import departmentRoutes from "./routes/departmentRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import studentRoutes from "./routes/studentRoutes.js"; // student management routes
import announcementRoutes from "./routes/announcementRoutes.js"; // announcement routes
import studentRequestRoutes from "./routes/studentRequestRoutes.js"; // student requests module
import facultyCourseRoutes from "./routes/facultyCourseRoutes.js"; // faculty course assignments
import rstRoutes from "./routes/rstRoutes.js"; // RST (Result Summary Table) routes
import resultsRoutes from "./routes/resultsRoutes.js"; // Results approval routes

// Import auth routes from organized auth folder
import { studentAuth, adminAuth } from "./src/routes/auth/index.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // parses URL-encoded requests

// Routes
app.use("/departments", departmentRoutes);
app.use("/semesters", semesterRoutes);
app.use("/courses", courseRoutes);
app.use("/auth", studentAuth); // Student authentication: login, forgot-password, reset-password
app.use("/admin/auth", adminAuth); // Admin authentication: login, verify, forgot-password, reset-password
app.use("/faculties", facultyRoutes);
app.use("/students", studentRoutes); // student management routes
app.use("/announcements", announcementRoutes); // announcement routes
app.use("/requests", studentRequestRoutes); // student requests module (both student and coordinator)
app.use("/api", studentRequestRoutes); // Also mount at /api for new endpoints
app.use("/faculty-courses", facultyCourseRoutes); // faculty course assignments
app.use("/results", resultsRoutes); // results approval & student results
app.use("/", rstRoutes); // RST routes

// Default route (optional)
app.get("/", (req, res) => {
  res.send("University ERP Backend is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`${"=".repeat(60)}`);
  
  // Check SMTP configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("\n⚠️  WARNING: SMTP NOT CONFIGURED");
    console.warn("📧 Password reset emails WILL NOT BE SENT");
    console.warn("📖 See backend/EMAIL_SETUP.md for setup instructions");
    console.warn("📝 Email content will be logged to console instead\n");
  } else {
    console.log("\n✅ SMTP Configured");
    console.log(`📧 Emails will be sent from: ${process.env.FROM_EMAIL || "no-reply@university.local"}`);
    console.log(`🔧 Using ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}\n`);
  }
  console.log(`${"=".repeat(60)}\n`);
});
