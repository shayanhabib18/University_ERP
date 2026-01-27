const API_BASE = "http://localhost:5000/faculty-messages";

const getToken = () => localStorage.getItem("facultyToken");

export const facultyMessageAPI = {
  sendMessage: async ({ recipientFacultyId, subject, body, file }) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("recipientFacultyId", recipientFacultyId);
    if (subject) formData.append("subject", subject);
    if (body) formData.append("body", body);
    if (file) formData.append("file", file);

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-role": "faculty",
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to send message");
    }
    return res.json();
  },

  getInbox: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/inbox`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-role": "faculty",
      },
    });
    if (!res.ok) throw new Error("Failed to load inbox");
    return res.json();
  },

  getSent: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/sent`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-role": "faculty",
      },
    });
    if (!res.ok) throw new Error("Failed to load sent messages");
    return res.json();
  },

  deleteMessage: async (messageId) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/${messageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-role": "faculty",
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete message");
    }
    return res.json();
  },
};

export default facultyMessageAPI;
