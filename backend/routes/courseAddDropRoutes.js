import express from 'express';
import {
  getStudentsByDepartment,
  getStudentEnrollments,
  getAvailableCourses,
  addCourseForStudent,
  dropCourseForStudent,
  getStudentEnrollmentsBySemester,
  getDepartmentStudentsWithEnrollments,
} from '../controllers/CourseAddDropController.js';

const router = express.Router();

// ============================================
// COURSE ADD/DROP ROUTES
// ============================================

/**
 * GET /course-add-drop/department/:departmentId/students
 * Get all registered students in a department
 */
router.get('/department/:departmentId/students', getStudentsByDepartment);

/**
 * GET /course-add-drop/department/:departmentId/students-enrollments
 * Get all students in a department with their enrollments
 */
router.get(
  '/department/:departmentId/students-enrollments',
  getDepartmentStudentsWithEnrollments
);

/**
 * GET /course-add-drop/department/:departmentId/available-courses
 * Get available courses for a department
 */
router.get(
  '/department/:departmentId/available-courses',
  getAvailableCourses
);

/**
 * GET /course-add-drop/student/:studentId/enrollments
 * Get all enrollments for a student
 */
router.get('/student/:studentId/enrollments', getStudentEnrollments);

/**
 * GET /course-add-drop/student/:studentId/semester/:semesterId
 * Get enrollments for a student in a specific semester
 */
router.get(
  '/student/:studentId/semester/:semesterId',
  getStudentEnrollmentsBySemester
);

/**
 * POST /course-add-drop/add
 * Add a course for a student
 */
router.post('/add', addCourseForStudent);

/**
 * DELETE /course-add-drop/drop/:enrollmentId
 * Drop a course for a student
 */
router.delete('/drop/:enrollmentId', dropCourseForStudent);

export default router;
