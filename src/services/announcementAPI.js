// services/announcementAPI.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get announcements for a specific role (with attachments)
export const getAnnouncementsByRole = async (role) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/with-attachments?role=${role}`);
    if (!response.ok) {
      throw new Error("Failed to fetch announcements");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};

// Get announcements with attachments (alias)
export const getAnnouncementsWithAttachments = async (role) => {
  return getAnnouncementsByRole(role);
};

// Get single announcement
export const getAnnouncementById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch announcement");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching announcement:", error);
    throw error;
  }
};

// Create announcement
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(announcementData),
    });

    if (!response.ok) {
      throw new Error("Failed to create announcement");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

// Update announcement
export const updateAnnouncement = async (id, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to update announcement");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};

// Delete announcement
export const deleteAnnouncement = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete announcement");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

// Upload attachment
export const uploadAttachment = async (announcementId, file) => {
  try {
    const formData = new FormData();
    formData.append("announcementId", announcementId);
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/announcements/attachment/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload attachment");
    }
    return await response.json();
  } catch (error) {
    console.error("Error uploading attachment:", error);
    throw error;
  }
};

// Get announcements by sender role
export const getAnnouncementsBySenderRole = async (senderRole) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/announcements/sender/${senderRole}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch announcements");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching announcements by sender:", error);
    throw error;
  }
};
