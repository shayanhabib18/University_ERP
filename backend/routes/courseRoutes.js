// backend/routes/courseRoutes.js
import express from "express";
import {
  getAllCourses,
  getCoursesBySemester,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/CourseController.js";

const router = express.Router();

// Get all courses
router.get("/", getAllCourses);

// Get courses by semester
router.get("/semester/:id", getCoursesBySemester);

// Add a course
router.post("/", addCourse);

// Update a course
router.put("/:id", updateCourse);

// Delete a course
router.delete("/:id", deleteCourse);

export default router;
