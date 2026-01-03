import React, { useState, useEffect } from "react";
import AnnouncementItem from "./AnnouncementItem";
import CreateAnnouncementModal from "./CreateAnnouncementModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AnnouncementsList = ({ role, canSend = false, allowedRecipients = [] }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Define which sender roles are allowed per user role (who they can RECEIVE from)
  const allowedSenders = {
    admin: ["admin"],
    student: ["faculty", "coordinator"],
    faculty: ["coordinator", "dept_chair"],
    dept_chair: ["executive", "coordinator"],
    executive: ["coordinator", "dept_chair"],
    coordinator: ["admin", "faculty", "executive", "dept_chair"],
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from backend API
        const response = await fetch(
          `${API_BASE_URL}/announcements?role=${role}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }

        const result = await response.json();
        const fetchedAnnouncements = result.data || [];

        // Format announcements to match component expectations
        const formattedAnnouncements = fetchedAnnouncements.map((ann) => ({
          id: ann.id,
          title: ann.title,
          message: ann.message,
          senderName: ann.senderName,
          senderRole: ann.senderRole,
          date: ann.createdAt,
          readBy: [],
          attachment: null,
        }));

        setAnnouncements(formattedAnnouncements);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setError("Failed to load announcements. Please try again later.");
        // Fallback to empty array
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [role]);

  const handleAddAnnouncement = async (newAnnouncement) => {
    try {
      // Post to backend
      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newAnnouncement.title,
          message: newAnnouncement.message,
          senderId: newAnnouncement.senderId,
          senderRole: newAnnouncement.senderRole,
          senderName: newAnnouncement.senderName,
          recipientRoles: newAnnouncement.recipientRoles,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(errorData.error || "Failed to create announcement");
      }

      const result = await response.json();

      // Format and add to UI
      const formattedAnnouncement = {
        id: result.data.id,
        title: result.data.title,
        message: result.data.message,
        senderName: result.data.sender_name,
        senderRole: result.data.sender_role,
        date: result.data.created_at,
        readBy: [],
        attachment: null,
      };

      // Only add to UI if current role can receive from this sender
      if (allowedSenders[role]?.includes(formattedAnnouncement.senderRole)) {
        setAnnouncements([formattedAnnouncement, ...announcements]);
      }
    } catch (error) {
      console.error("Failed to create announcement:", error);
      alert("Failed to create announcement");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {canSend && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Announcement
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p className="text-gray-500">No announcements found.</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementItem
              key={announcement.id}
              announcement={announcement}
              role={role}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateAnnouncementModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddAnnouncement}
          allowedRecipients={allowedRecipients}
          senderRole={role}
          senderId={localStorage.getItem('userId') || '00000000-0000-0000-0000-000000000000'}
          senderName={localStorage.getItem('userName') || 'Current User'}
        />
      )}
    </div>
  );
};

export default AnnouncementsList;
