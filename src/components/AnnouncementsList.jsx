import React, { useState, useEffect } from "react";
import AnnouncementItem from "./AnnouncementItem";
import CreateAnnouncementModal from "./CreateAnnouncementModal";
import { updateAnnouncement, deleteAnnouncement as apiDelete, getAnnouncementsBySenderRole } from "../services/announcementAPI";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AnnouncementsList = ({ role, canSend = false, allowedRecipients = [], sentOnly = false }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const currentUserId = localStorage.getItem("userId") || null;

  // Define which sender roles are allowed per user role (who they can RECEIVE from)
  const allowedSenders = {
    admin: ["admin"],
    student: ["faculty", "coordinator", "student"],
    faculty: ["coordinator", "dept_chair", "faculty"],
    dept_chair: ["executive", "coordinator", "dept_chair"],
    executive: ["coordinator", "dept_chair", "executive"],
    coordinator: ["admin", "faculty", "executive", "dept_chair", "coordinator"],
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        if (sentOnly) {
          const result = await getAnnouncementsBySenderRole(role);
          const fetched = result.data || [];
          
          // Fetch full details including attachments for each announcement
          const formattedWithAttachments = await Promise.all(
            fetched.map(async (ann) => {
              let attachments = [];
              try {
                const detailResponse = await fetch(
                  `${API_BASE_URL}/announcements/${ann.id}`
                );
                if (detailResponse.ok) {
                  const detail = await detailResponse.json();
                  attachments = (detail.data?.attachments || []).map((att) => ({
                    id: att.id,
                    fileName: att.file_name || att.fileName,
                    fileUrl: att.file_url || att.fileUrl,
                  }));
                }
              } catch (err) {
                console.error(`Failed to fetch details for announcement ${ann.id}:`, err);
              }
              
              return {
                id: ann.id,
                title: ann.title,
                message: ann.message,
                senderId: ann.senderId || ann.sender_id,
                senderName: ann.senderName,
                senderRole: ann.senderRole,
                date: ann.createdAt,
                readBy: [],
                attachments,
                recipients: ann.recipientRoles || [],
              };
            })
          );
          
          const sorted = [...formattedWithAttachments].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          setAnnouncements(sorted);
        } else {
          const response = await fetch(
            `${API_BASE_URL}/announcements/with-attachments?role=${role}`
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
            senderId: ann.senderId || ann.sender_id,
            senderName: ann.senderName,
            senderRole: ann.senderRole,
            date: ann.createdAt,
            readBy: [],
            attachments: (ann.attachments || []).map((att) => ({
              id: att.id,
              fileName: att.file_name || att.fileName,
              fileUrl: att.file_url || att.fileUrl,
            })),
            recipients: ann.recipientRoles || (ann.recipientRole ? [ann.recipientRole] : []),
          }));

          const sorted = [...formattedAnnouncements].sort(
            (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
          );
          setAnnouncements(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setError("Failed to load announcements. Please try again later.");
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [role, sentOnly]);

  const handleAddAnnouncement = async (newAnnouncement, editId) => {
    try {
      const payload = {
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        senderId: newAnnouncement.senderId,
        senderRole: newAnnouncement.senderRole,
        senderName: newAnnouncement.senderName,
        recipientRoles: newAnnouncement.recipientRoles,
      };

      let result;
      if (editId) {
        result = await updateAnnouncement(editId, {
          title: payload.title,
          message: payload.message,
          recipientRoles: payload.recipientRoles,
        });
      } else {
        const response = await fetch(`${API_BASE_URL}/announcements`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend error:", errorData);
          throw new Error(errorData.error || "Failed to create announcement");
        }

        result = await response.json();
      }

      // Format and add to UI
      let attachments = editId
        ? announcements.find((a) => a.id === editId)?.attachments || []
        : [];

      if (newAnnouncement.file) {
        const formData = new FormData();
        formData.append("announcementId", editId || result.data.id);
        formData.append("file", newAnnouncement.file);

        try {
          const token = localStorage.getItem("facultyToken") || localStorage.getItem("coordinator_token") || localStorage.getItem("token");
          const uploadHeaders = {};
          if (token) {
            uploadHeaders.Authorization = `Bearer ${token}`;
          }
          
          const uploadResponse = await fetch(`${API_BASE_URL}/announcements/attachment/upload`, {
            method: "POST",
            headers: uploadHeaders,
            body: formData,
          });

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json().catch(() => ({}));
            console.error("Attachment upload failed:", uploadError);
            throw new Error(uploadError?.error || "Failed to upload attachment");
          } else {
            const uploadResult = await uploadResponse.json();
            if (uploadResult?.data) {
              attachments = [
                {
                  id: uploadResult.data.id,
                  fileName: uploadResult.data.file_name || uploadResult.data.fileName,
                  fileUrl: uploadResult.data.file_url || uploadResult.data.fileUrl,
                },
                ...attachments,
              ];
            }
          }
        } catch (err) {
          console.error("Attachment upload error:", err);
          alert("Failed to upload attachment: " + err.message);
        }
      }

      const formattedAnnouncement = {
        id: editId || result.data.id,
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        senderId: newAnnouncement.senderId,
        senderName: newAnnouncement.senderName,
        senderRole: newAnnouncement.senderRole,
        date:
          result.data.created_at ||
          announcements.find((a) => a.id === editId)?.date ||
          new Date().toISOString(),
        readBy: [],
        attachments,
        recipients: newAnnouncement.recipientRoles || [],
      };

      if (editId) {
        setAnnouncements((prev) => prev.map((a) => (a.id === editId ? { ...formattedAnnouncement } : a)));
      } else {
        const canReceive =
          allowedSenders[role]?.includes(formattedAnnouncement.senderRole) ||
          formattedAnnouncement.senderRole === role;
        if (canReceive) {
          setAnnouncements([formattedAnnouncement, ...announcements]);
        }
      }
    } catch (error) {
      console.error("Failed to create announcement:", error);
      alert("Failed to create announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcement) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await apiDelete(announcement.id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcement.id));
      // Optionally show a success message
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      alert("Failed to delete announcement. Please try again.");
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
          {announcements.map((announcement) => {
            const canEdit = announcement.senderId && currentUserId
              ? announcement.senderId === currentUserId
              : announcement.senderRole === role;
            const canDismiss = true; // everyone can remove from own view
            return (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                role={role}
                canEdit={canEdit}
                canDismiss={canDismiss}
                onEdit={(ann) => {
                  if (!canEdit) return;
                  setEditing(ann);
                  setShowModal(true);
                }}
                onDelete={(ann) => handleDeleteAnnouncement(ann)}
              />
            );
          })}
        </div>
      )}

      {showModal && (
        <CreateAnnouncementModal
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSubmit={handleAddAnnouncement}
          initialData={editing}
          mode={editing ? "edit" : "create"}
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
