import { useState } from "react";
import {
  Megaphone,
  Trash2,
  Edit3,
  Send,
  Inbox,
  Users,
  BookOpen,
} from "lucide-react";

export default function ChairAnnouncements() {
  const [tab, setTab] = useState("sent"); // sent | received
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Faculty Meeting", message: "Meeting on Monday at 10 AM.", audience: "Faculty", date: "2025-10-20", type: "sent" },
    { id: 2, title: "Midterm Reminder", message: "Midterms start next week. Prepare accordingly.", audience: "Students", date: "2025-10-18", type: "sent" },
    { id: 3, title: "University Clean-up Drive", message: "All departments must participate in the event.", audience: "All Faculty", date: "2025-10-17", type: "received", sender: "Admin Office" },
    { id: 4, title: "Research Grant Notice", message: "New funding opportunities available for 2025.", audience: "HODs", date: "2025-10-15", type: "received", sender: "Executive Board" },
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    audience: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Handle Add or Update
  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.message || !newAnnouncement.audience)
      return alert("Please fill in all fields!");

    if (editingId) {
      setAnnouncements(
        announcements.map((a) =>
          a.id === editingId
            ? {
                ...newAnnouncement,
                id: editingId,
                type: "sent",
                date: new Date().toISOString().split("T")[0],
              }
            : a
        )
      );
      setEditingId(null);
    } else {
      setAnnouncements([
        ...announcements,
        {
          ...newAnnouncement,
          id: Date.now(),
          type: "sent",
          date: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setNewAnnouncement({ title: "", message: "", audience: "" });
  };

  // Edit Announcement
  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setNewAnnouncement(announcement);
  };

  // Delete Announcement
  const handleDelete = (id) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const displayedAnnouncements = announcements.filter((a) => a.type === tab);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Megaphone className="text-blue-600" /> Department Announcements
        </h1>

        {/* Tab Buttons */}
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button
            onClick={() => setTab("sent")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "sent"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-700 hover:bg-gray-100"
            }`}
          >
            Sent Announcements
          </button>
          <button
            onClick={() => setTab("received")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === "received"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-700 hover:bg-gray-100"
            }`}
          >
            Received Announcements
          </button>
        </div>
      </div>

      {/* Sent Announcements Section */}
      {tab === "sent" && (
        <div className="bg-white p-5 rounded-2xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Announcement" : "Create New Announcement"}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title"
              className="border p-2 rounded-lg w-full"
              value={newAnnouncement.title}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
              }
            />
            <select
              className="border p-2 rounded-lg w-full"
              value={newAnnouncement.audience}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  audience: e.target.value,
                })
              }
            >
              <option value="">Select Audience</option>
              <option value="Faculty">Faculty</option>
              <option value="Students">Students</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <textarea
            placeholder="Write your announcement..."
            className="border p-2 rounded-lg w-full mb-4 h-28 resize-none"
            value={newAnnouncement.message}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
            }
          ></textarea>

          <button
            onClick={handleAddAnnouncement}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Send size={18} /> {editingId ? "Update" : "Post"} Announcement
          </button>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white p-5 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          {tab === "sent" ? "Your Announcements" : "Received Announcements"}
        </h2>

        {displayedAnnouncements.length === 0 ? (
          <p className="text-gray-500 text-center">
            No {tab === "sent" ? "sent" : "received"} announcements found.
          </p>
        ) : (
          <div className="space-y-4">
            {displayedAnnouncements.map((a) => (
              <div
                key={a.id}
                className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{a.title}</h3>
                  <p className="text-gray-600 text-sm mb-1">{a.message}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {a.audience}
                    </span>
                    <span>{a.date}</span>
                    {a.type === "received" && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        From: {a.sender}
                      </span>
                    )}
                  </div>
                </div>
                {tab === "sent" && (
                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
