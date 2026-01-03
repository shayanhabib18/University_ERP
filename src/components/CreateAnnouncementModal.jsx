import React, { useState } from "react";

const CreateAnnouncementModal = ({ onClose, onSubmit, allowedRecipients, senderRole, senderId, senderName }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleRecipientToggle = (recipient) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipient)
        ? prev.filter((r) => r !== recipient)
        : [...prev, recipient]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRecipients.length === 0) {
      alert("Please select at least one recipient role");
      return;
    }

    setSubmitting(true);

    try {
      const newAnnouncement = {
        title,
        message,
        senderId: senderId || "00000000-0000-0000-0000-000000000000",
        senderRole: senderRole || "admin",
        senderName: senderName || "Current User",
        recipientRoles: selectedRecipients,
        attachment: file ? file.name : null,
      };

      console.log("Submitting announcement:", newAnnouncement);
      await onSubmit(newAnnouncement);
      
      // Reset form
      setTitle("");
      setMessage("");
      setSelectedRecipients([]);
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Error submitting announcement:", error);
      alert("Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              required
              placeholder="Enter announcement title"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block mb-1 font-medium">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border p-2 rounded min-h-[100px]"
              required
              placeholder="Enter announcement message"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block mb-1 font-medium">Attachment (optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            />
            {file && <p className="text-sm mt-1 text-gray-600">Selected: {file.name}</p>}
          </div>

          {/* Recipients - Checkboxes */}
          <div>
            <label className="block mb-2 font-medium">Send to Roles</label>
            <div className="border rounded p-3 space-y-2 bg-gray-50">
              {allowedRecipients.length > 0 ? (
                allowedRecipients.map((role) => (
                  <div key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      id={role}
                      checked={selectedRecipients.includes(role)}
                      onChange={() => handleRecipientToggle(role)}
                      className="mr-2 w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor={role}
                      className="capitalize cursor-pointer flex-1"
                    >
                      {role.replace(/_/g, " ")}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recipient roles available</p>
              )}
            </div>
            {selectedRecipients.length === 0 && (
              <p className="text-sm text-red-600 mt-1">Please select at least one recipient</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedRecipients.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
