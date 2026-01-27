import express from "express";
import {
  generateQuiz,
  getFacultyQuizzes,
  shareQuiz,
  submitQuizAnswer,
  getQuizSubmissions,
  deleteQuiz,
  getStudentQuizzes,
  debugStudentQuizzes,
} from "../controllers/QuizController.js";
import { requireAuth } from "../src/middleware/auth.js";

const router = express.Router();

// Faculty routes
router.post("/generate", requireAuth, generateQuiz);
router.get("/faculty", requireAuth, getFacultyQuizzes);
router.post("/:quizId/share", requireAuth, shareQuiz);
router.get("/:quizId/submissions", requireAuth, getQuizSubmissions);
router.delete("/:quizId", requireAuth, deleteQuiz);

// Student routes
router.get("/student/available", requireAuth, getStudentQuizzes);
router.get("/student/debug", requireAuth, debugStudentQuizzes);
router.post("/:quizId/submit", requireAuth, submitQuizAnswer);

export default router;
