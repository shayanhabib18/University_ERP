// src/components/Announcements/AnnouncementsList.jsx
import React, { useState, useEffect } from "react";
import AnnouncementItem from "./AnnouncementItem";
import CreateAnnouncementModal from "./CreateAnnouncementModal";

const AnnouncementsList = ({ role, canSend = false, allowedRecipients = [] }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch announcements from backend API (mock URL used here)
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://mock-api.example.com/announcements?role=${role}`
        );
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [role]);

  // Handle adding a new announcement after submission
  const handleAddAnnouncement = (newAnnouncement) => {
    setAnnouncements([newAnnouncement, ...announcements]);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* Top section: Create button (role-based) */}
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

      {/* Announcements list */}
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
              role={role} // pass role if behavior varies (e.g., read/unread marking)
            />
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showModal && (
        <CreateAnnouncementModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddAnnouncement}
          allowedRecipients={allowedRecipients}
        />
      )}
    </div>
  );
};

export default AnnouncementsList;
