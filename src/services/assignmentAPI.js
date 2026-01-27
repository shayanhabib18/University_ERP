const API_BASE_URL = "http://localhost:5000/assignments";

export const assignmentAPI = {
  // Faculty: Create assignment
  createAssignment: async (assignmentData, file) => {
    const token = localStorage.getItem("facultyToken");
    const formData = new FormData();
    
    Object.keys(assignmentData).forEach(key => {
      formData.append(key, assignmentData[key]);
    });
    
    if (file) {
      formData.append("file", file);
    }

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "x-role": "faculty"
      },
      body: formData,
    });

    if (!response.ok) {
      let msg = "Failed to create assignment";
      try {
        const error = await response.json();
        msg = error?.error || msg;
      } catch (e) {
        // ignore parse errors
      }
      throw new Error(msg);
    }

    return response.json();
  },

  // Faculty: Get submissions for assignment
  getSubmissions: async (assignmentId) => {
    const token = localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/${assignmentId}/submissions`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "x-role": "faculty"
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch submissions");
    }

    return response.json();
  },

  // Student: Get assignments
  getAssignments: async () => {
    const token = localStorage.getItem("studentToken") || localStorage.getItem("student_token");
    const response = await fetch(`${API_BASE_URL}/student`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "x-role": "student"
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch assignments");
    }

    return response.json();
  },

  // Student: Submit assignment
  submitAssignment: async (assignmentId, file) => {
    const token = localStorage.getItem("studentToken") || localStorage.getItem("student_token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/${assignmentId}/submit`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "x-role": "student"
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to submit assignment");
    }

    return response.json();
  },
};

export default assignmentAPI;
