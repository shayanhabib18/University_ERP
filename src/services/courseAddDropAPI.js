// src/services/courseAddDropAPI.js
// API calls for course add/drop management

const API_BASE_URL = "http://localhost:5000";

const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch (parseErr) {
      parsed = null;
    }

    if (!response.ok) {
      const detail = parsed?.error || parsed?.message || response.statusText;
      throw new Error(`API Error: ${detail}`);
    }

    return parsed;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// COURSE ADD/DROP API
export const courseAddDropAPI = {
  // Get all registered students in a department
  getStudentsByDepartment: (departmentId) =>
    apiCall(`/course-add-drop/department/${departmentId}/students`),

  // Get all students in a department with their enrollments
  getDepartmentStudentsWithEnrollments: (departmentId) =>
    apiCall(`/course-add-drop/department/${departmentId}/students-enrollments`),

  // Get available courses for a department
  getAvailableCourses: (departmentId, semesterId = null) => {
    let endpoint = `/course-add-drop/department/${departmentId}/available-courses`;
    if (semesterId) {
      endpoint += `?semesterId=${semesterId}`;
    }
    return apiCall(endpoint);
  },

  // Get all enrollments for a student
  getStudentEnrollments: (studentId) =>
    apiCall(`/course-add-drop/student/${studentId}/enrollments`),

  // Get enrollments for a student in a specific semester
  getStudentEnrollmentsBySemester: (studentId, semesterId) =>
    apiCall(`/course-add-drop/student/${studentId}/semester/${semesterId}`),

  // Add a course for a student
  addCourse: (studentId, courseId) =>
    apiCall("/course-add-drop/add", {
      method: "POST",
      body: JSON.stringify({
        student_id: studentId,
        course_id: courseId,
      }),
    }),

  // Drop a course for a student
  dropCourse: (enrollmentId) =>
    apiCall(`/course-add-drop/drop/${enrollmentId}`, {
      method: "DELETE",
    }),
};
