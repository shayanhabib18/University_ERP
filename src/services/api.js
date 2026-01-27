// src/services/api.js
const API_BASE_URL = "http://localhost:5000";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    // Try to read json even on errors to surface backend message
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

// Department API
export const departmentAPI = {
  getAll: () => apiCall("/departments"),
  create: (data) =>
    apiCall("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/departments/${id}`, {
      method: "DELETE",
    }),
  getHOD: (departmentId) =>
    apiCall(`/departments/${departmentId}/hod`),
  assignHOD: (departmentId, payload) =>
    apiCall(`/departments/${departmentId}/assign-hod`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Semester API
export const semesterAPI = {
  getAll: () => apiCall("/semesters"),
  getByDepartment: (departmentId) =>
    apiCall(`/semesters/department/${departmentId}`),
  create: (data) =>
    apiCall("/semesters", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/semesters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/semesters/${id}`, {
      method: "DELETE",
    }),
};

// Course API
export const courseAPI = {
  getAll: () => apiCall("/courses"),
  getBySemester: (semesterId) => apiCall(`/courses/semester/${semesterId}`),
  create: (data) =>
    apiCall("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/courses/${id}`, {
      method: "DELETE",
    }),
};

// Faculty API
export const facultyAPI = {
  getAll: () => apiCall("/faculties"),
  getByDepartment: (departmentId) =>
    apiCall(`/faculties/department/${departmentId}`),
  getProfile: (token) =>
    apiCall("/faculties/profile", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getCurrentExecutive: () =>
    apiCall("/faculties/executive/current"),
  create: (data) =>
    apiCall("/faculties", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/faculties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/faculties/${id}`, {
      method: "DELETE",
    }),
  assignExecutive: (payload) =>
    apiCall("/faculties/assign-executive", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  assignCourses: (facultyId, courseIds) =>
    apiCall("/faculty-courses/assign", {
      method: "POST",
      body: JSON.stringify({ faculty_id: facultyId, course_ids: courseIds }),
    }),
  getFacultyCourses: (facultyId) =>
    apiCall(`/faculty-courses/faculty/${facultyId}`),
  getUnassignedCourses: (facultyId) =>
    apiCall(`/faculty-courses/unassigned/${facultyId}`),
  removeCourse: (facultyId, courseId) =>
    apiCall(`/faculty-courses/${facultyId}/${courseId}`, {
      method: "DELETE",
    }),
  uploadDocuments: async (facultyId, files) => {
    const formData = new FormData();
    Array.from(files || []).forEach((file) => formData.append("files", file));

    const response = await fetch(`${API_BASE_URL}/faculties/${facultyId}/documents`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch (_err) {
      parsed = null;
    }

    if (!response.ok) {
      const detail = parsed?.error || parsed?.message || response.statusText;
      throw new Error(`API Error: ${detail}`);
    }

    return parsed;
  },
  getDocuments: (facultyId) =>
    apiCall(`/faculties/${facultyId}/documents`),
};

// Student API (aligned with new Supabase schema)
export const studentAPI = {
  getAll: () => apiCall("/students"),
  getByDepartment: (departmentId) =>
    apiCall(`/students/department/${departmentId}`),
  search: (query) =>
    apiCall(`/students/search?q=${encodeURIComponent(query)}`),
  getOne: (id) => apiCall(`/students/${id}`),
  create: (data) =>
    apiCall("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiCall(`/students/${id}`, {
      method: "DELETE",
    }),
};

// Academic Records API
export const academicRecordsAPI = {
  // Get all records for a student
  getByStudent: (studentId) => apiCall(`/students/academic-records/student/${studentId}`),

  // Get specific semester record
  getBySemester: (studentId, semester) =>
    apiCall(`/students/academic-records/student/${studentId}/semester/${semester}`),

  // Create academic record
  create: (data) =>
    apiCall("/students/academic-records", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update academic record
  update: (recordId, data) =>
    apiCall(`/students/academic-records/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete academic record
  delete: (recordId) =>
    apiCall(`/students/academic-records/${recordId}`, {
      method: "DELETE",
    }),
};

export default {
  departments: departmentAPI,
  semesters: semesterAPI,
  courses: courseAPI,
  faculties: facultyAPI,
  students: studentAPI,
  academicRecords: academicRecordsAPI,
};
