// src/components/Announcements/CreateAnnouncementModal.jsx
import React, { useState } from "react";

const CreateAnnouncementModal = ({
  onClose,
  onSubmit,
  allowedRecipients = [],
  senderRole = "user",
  senderName = "You",
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [important, setImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!title.trim() || !message.trim() || recipients.length === 0) {
      setSubmitting(false);
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title: title.trim(),
      message: message.trim(),
      senderName,
      senderRole,
      date: new Date().toISOString(),
      important,
      readBy: [],
      recipients,
    };

    onSubmit(newAnnouncement);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Recipients</label>
            <select
              multiple
              value={recipients}
              onChange={(e) =>
                setRecipients(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="w-full border p-2 rounded"
              required
            >
              {allowedRecipients.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="important"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
            />
            <label htmlFor="important">Mark as Important</label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {submitting ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;
