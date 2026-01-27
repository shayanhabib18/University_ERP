const API_BASE_URL = "http://localhost:5000";

const quizAPI = {
  // Generate quiz with AI
  generateQuiz: async (data) => {
    const token = localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/quizzes/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate quiz");
    }

    return response.json();
  },

  // Get all faculty quizzes
  getFacultyQuizzes: async () => {
    const token = localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/quizzes/faculty`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch quizzes");
    }

    return response.json();
  },

  // Share quiz with students
  shareQuiz: async (quizId, deadline) => {
    const token = localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ deadline }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to share quiz");
    }

    return response.json();
  },

  // Get quiz submissions (for faculty)
  getQuizSubmissions: async (quizId) => {
    const token = localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch submissions");
    }

    const data = await response.json();
    // Backend returns { success: true, submissions: [...], quiz: {...} }
    // Extract the submissions array
    return data.submissions || [];
  },

  // Get available quizzes for students
  getStudentQuizzes: async () => {
    const token = localStorage.getItem("studentToken") || localStorage.getItem("student_token");
    console.log("🔑 Student quiz token check:", { 
      studentToken: !!localStorage.getItem("studentToken"),
      student_token: !!localStorage.getItem("student_token"),
      hasToken: !!token 
    });
    
    const response = await fetch(`${API_BASE_URL}/quizzes/student/available`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Quiz fetch failed:", error);
      throw new Error(error.error || "Failed to fetch quizzes");
    }

    return response.json();
  },

  // Submit quiz answer (for students)
  submitQuizAnswer: async (quizId, answers) => {
    const token = localStorage.getItem("studentToken") || localStorage.getItem("student_token");
    if (!token) {
      console.error("❌ No student token found in localStorage for quiz submission.");
      throw new Error("Unauthorized: missing student token");
    }
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to submit quiz");
    }

    return response.json();
  },

  // Delete quiz
  deleteQuiz: async (quizId) => {
    const token = localStorage.getItem("facultyToken");
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete quiz");
    }

    return response.json();
  },
};

export default quizAPI;
