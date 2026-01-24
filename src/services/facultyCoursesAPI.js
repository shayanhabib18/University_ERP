// API Service for Faculty Courses
const API_URL = "http://localhost:5000";

export const facultyCoursesAPI = {
  // Get all courses assigned to a faculty member
  getFacultyCourses: async (facultyId) => {
    const response = await fetch(`${API_URL}/faculty-courses/faculty/${facultyId}`);
    if (!response.ok) throw new Error("Failed to fetch courses");
    return response.json();
  },

  // Get course details including students and materials
  getCourseDetails: async (facultyId, courseId) => {
    const response = await fetch(`${API_URL}/faculty-courses/faculty/${facultyId}/course/${courseId}`);
    if (!response.ok) throw new Error("Failed to fetch course details");
    return response.json();
  },

  // Get students enrolled in a course
  getCourseStudents: async (courseId) => {
    const response = await fetch(`${API_URL}/enrollments/course/${courseId}`);
    if (!response.ok) throw new Error("Failed to fetch students");
    return response.json();
  },

  // Get course materials
  getCourseMaterials: async (courseId) => {
    const response = await fetch(`${API_URL}/course-materials/${courseId}`);
    if (!response.ok) throw new Error("Failed to fetch materials");
    return response.json();
  },
};
