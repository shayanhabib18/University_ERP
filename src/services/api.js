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

export default {
  departments: departmentAPI,
  semesters: semesterAPI,
  courses: courseAPI,
};
