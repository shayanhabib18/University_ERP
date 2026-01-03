// src/services/studentAPI.js
// API calls for student management operations

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

// STUDENT API
export const studentAPI = {
  // Get all students
  getAll: () => apiCall("/students"),

  // Get students by department
  getByDepartment: (departmentId) =>
    apiCall(`/students/department/${departmentId}`),

  // Get single student
  getById: (studentId) => apiCall(`/students/${studentId}`),

  // Create new student
  create: (data) =>
    apiCall("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update student
  update: (studentId, data) =>
    apiCall(`/students/${studentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete student
  delete: (studentId) =>
    apiCall(`/students/${studentId}`, {
      method: "DELETE",
    }),

  // Search students
  search: (query) =>
    apiCall(`/students/search?q=${encodeURIComponent(query)}`),

  // Get student by roll number
  getByRollNumber: (rollNumber) =>
    apiCall(`/students/roll/${rollNumber}`),
};

// ACADEMIC RECORDS API
export const academicRecordsAPI = {
  // Get all records for a student
  getByStudent: (studentId) =>
    apiCall(`/academic-records/student/${studentId}`),

  // Get specific semester record
  getBySemester: (studentId, semester) =>
    apiCall(`/academic-records/student/${studentId}/semester/${semester}`),

  // Create academic record
  create: (data) =>
    apiCall("/academic-records", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update academic record
  update: (recordId, data) =>
    apiCall(`/academic-records/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete academic record
  delete: (recordId) =>
    apiCall(`/academic-records/${recordId}`, {
      method: "DELETE",
    }),
};

// STUDENT DOCUMENTS API
export const documentsAPI = {
  // Get all documents for a student
  getByStudent: (studentId) =>
    apiCall(`/documents/student/${studentId}`),

  // Upload document
  upload: (studentId, file, documentType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    return fetch(`${API_BASE_URL}/documents/student/${studentId}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error("Upload failed:", err);
        throw err;
      });
  },

  // Delete document
  delete: (documentId) =>
    apiCall(`/documents/${documentId}`, {
      method: "DELETE",
    }),
};

// COURSE ENROLLMENTS API
export const enrollmentsAPI = {
  // Get enrollments for a student
  getByStudent: (studentId) =>
    apiCall(`/enrollments/student/${studentId}`),

  // Get enrollments for a semester
  getBySemester: (studentId, semester) =>
    apiCall(`/enrollments/student/${studentId}/semester/${semester}`),

  // Enroll student in course
  create: (data) =>
    apiCall("/enrollments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update enrollment
  update: (enrollmentId, data) =>
    apiCall(`/enrollments/${enrollmentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Drop course
  drop: (enrollmentId) =>
    apiCall(`/enrollments/${enrollmentId}/drop`, {
      method: "PUT",
    }),
};

export default {
  students: studentAPI,
  academicRecords: academicRecordsAPI,
  documents: documentsAPI,
  enrollments: enrollmentsAPI,
};
