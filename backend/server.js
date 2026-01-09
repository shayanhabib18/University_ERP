// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import route files
import departmentRoutes from "./routes/departmentRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
// Removed legacy admin login routes to avoid confusion (using Supabase Auth routes instead)
import facultyRoutes from "./routes/facultyRoutes.js";
import studentRoutes from "./routes/studentRoutes.js"; // student management routes
import announcementRoutes from "./routes/announcementRoutes.js"; // announcement routes
import authRoutes from "./src/routes/auth.js"; // Supabase Auth proxy routes

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
app.use("/auth", authRoutes); // Supabase Auth login via backend
app.use("/faculties", facultyRoutes);
app.use("/students", studentRoutes); // student management routes
app.use("/announcements", announcementRoutes); // announcement routes

// Default route (optional)
app.get("/", (req, res) => {
  res.send("University ERP Backend is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
