import express from "express";
import multer from "multer";
import {
  createAssignment,
  getAssignmentsByStudent,
  getAssignmentsByFaculty,
  submitAssignment,
  getAssignmentSubmissions,
} from "../controllers/AssignmentController.js";
import { requireAuth, requireRole } from "../src/middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Faculty routes
router.post("/", requireAuth, requireRole(["faculty"]), upload.single("file"), createAssignment);
router.get("/", requireAuth, requireRole(["faculty"]), getAssignmentsByFaculty);
router.get("/:assignmentId/submissions", requireAuth, requireRole(["faculty"]), getAssignmentSubmissions);

// Student routes
router.get("/student", requireAuth, requireRole(["student"]), getAssignmentsByStudent);
router.post("/:assignmentId/submit", requireAuth, requireRole(["student"]), upload.single("file"), submitAssignment);

export default router;
