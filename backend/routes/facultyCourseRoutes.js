// backend/routes/facultyCourseRoutes.js
import express from "express";
import {
  assignCoursesToFaculty,
  removeCourseFromFaculty,
  getFacultyCourses,
  getFacultyCourseDetails,
  getAllFacultyWithCourses,
  getUnassignedCoursesForFaculty
} from "../controllers/FacultyCourseController.js";

const router = express.Router();

// Assign courses to faculty
router.post("/assign", assignCoursesToFaculty);

// Remove course from faculty
router.delete("/:faculty_id/:course_id", removeCourseFromFaculty);

// Get all courses assigned to a faculty
router.get("/faculty/:faculty_id", getFacultyCourses);

// Get detailed course info for faculty
router.get("/faculty/:faculty_id/course/:course_id", getFacultyCourseDetails);

// Get all faculty with their courses
router.get("/all-with-courses", getAllFacultyWithCourses);

// Get unassigned courses for a faculty
router.get("/unassigned/:faculty_id", getUnassignedCoursesForFaculty);

export default router;
