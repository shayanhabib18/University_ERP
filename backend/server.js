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
import materialRoutes from "./routes/materialRoutes.js"; // course materials routes
import studentRequestRoutes from "./routes/studentRequestRoutes.js"; // student requests module
import facultyCourseRoutes from "./routes/facultyCourseRoutes.js"; // faculty course assignments
import rstRoutes from "./routes/rstRoutes.js"; // RST (Result Summary Table) routes
import resultsRoutes from "./routes/resultsRoutes.js"; // Results approval routes
import assignmentRoutes from "./routes/assignmentRoutes.js"; // assignment routes
import facultyMessageRoutes from "./routes/facultyMessageRoutes.js"; // faculty messaging routes
import quizRoutes from "./routes/quizRoutes.js"; // quiz routes
import loginActivityRoutes from "./routes/loginActivityRoutes.js"; // login activity tracking routes
import { initializeStorage } from "./controllers/CourseMaterialsController.js"; // course materials storage initialization
import { initializeAssignmentStorage } from "./controllers/AssignmentController.js"; // assignments storage initialization
import { initializeFacultyMessageStorage } from "./controllers/FacultyMessageController.js"; // faculty messages storage initialization
import { initializeFacultyDocumentStorage } from "./controllers/FacultyController.js"; // faculty documents storage initialization
import { initializeAnnouncementStorage } from "./controllers/AnnouncementController.js"; // announcement attachments storage initialization

// Import auth routes from organized auth folder
import { studentAuth, adminAuth } from "./src/routes/auth/index.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // parses URL-encoded requests
// Serve static files from /public under /static URL
app.use("/static", express.static("public"));

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
// Mount materials routes at both /course-materials and /api/course-materials for student portal
app.use("/course-materials", materialRoutes);
app.use("/api/course-materials", materialRoutes);
app.use("/assignments", assignmentRoutes); // assignment routes
app.use("/faculty-messages", facultyMessageRoutes); // faculty messaging routes
app.use("/quizzes", quizRoutes); // quiz routes
app.use("/login-activities", loginActivityRoutes); // login activity tracking routes

// Default route (optional)
app.get("/", (req, res) => {
  res.send("University ERP Backend is running!");
});

// Initialize storage
initializeStorage().catch(err => {
  console.error("⚠️  Failed to initialize storage:", err.message);
});
initializeAssignmentStorage().catch(err => {
  console.error("⚠️  Failed to initialize assignments storage:", err.message);
});
initializeFacultyMessageStorage().catch(err => {
  console.error("⚠️  Failed to initialize faculty messages storage:", err.message);
});
initializeFacultyDocumentStorage().catch(err => {
  console.error("⚠️  Failed to initialize faculty documents storage:", err.message);
});
initializeAnnouncementStorage().catch(err => {
  console.error("⚠️  Failed to initialize announcement attachments storage:", err.message);
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
