import React, { useState } from "react";
import { Megaphone, Send, Edit, Trash2 } from "lucide-react";

const roles = ["Admin", "Faculty", "Chairman", "Student", "Executive"]; // Coordinator can send to these

export default function CoordinatorAnnouncements() {
  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
    target: [],
  });

  const [postedAnnouncements, setPostedAnnouncements] = useState([]);
  const [editId, setEditId] = useState(null);

  const handleCheckboxChange = (role) => {
    setAnnouncement((prev) => {
      const isSelected = prev.target.includes(role);
      return {
        ...prev,
        target: isSelected
          ? prev.target.filter((r) => r !== role)
          : [...prev.target, role],
      };
    });
  };

  const handleSubmit = () => {
    if (!announcement.title || !announcement.message || announcement.target.length === 0) {
      return alert("Please fill all fields and select at least one target group.");
    }

    if (editId) {
      setPostedAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === editId ? { ...announcement, id: editId, date: new Date().toLocaleString() } : ann
        )
      );
      setEditId(null);
    } else {
      const newAnnouncement = {
        ...announcement,
        id: Date.now(),
        date: new Date().toLocaleString(),
      };
      setPostedAnnouncements([newAnnouncement, ...postedAnnouncements]);
    }

    setAnnouncement({
      title: "",
      message: "",
      target: [],
    });
  };

  const handleEdit = (id) => {
    const ann = postedAnnouncements.find((a) => a.id === id);
    setAnnouncement({ title: ann.title, message: ann.message, target: ann.target });
    setEditId(id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setPostedAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2 mb-4">
          <Megaphone size={24} />
          Coordinator Announcement
        </h2>

        <input
          type="text"
          placeholder="Announcement Title"
          value={announcement.title}
          onChange={(e) =>
            setAnnouncement({ ...announcement, title: e.target.value })
          }
          className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
        />

        <textarea
          placeholder="Write your announcement message here..."
          value={announcement.message}
          onChange={(e) =>
            setAnnouncement({ ...announcement, message: e.target.value })
          }
          rows={4}
          className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition resize-none"
        />

        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">Target Audience:</h4>
          <div className="flex flex-wrap gap-4">
            {roles.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={announcement.target.includes(role)}
                  onChange={() => handleCheckboxChange(role)}
                  className="accent-indigo-600 w-4 h-4"
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow flex items-center gap-2 transition"
        >
          <Send size={16} />
          {editId ? "Update Announcement" : "Post Announcement"}
        </button>
      </div>

      {/* Display Posted Announcements */}
      <div className="space-y-4">
        {postedAnnouncements.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No announcements posted yet.</p>
        ) : (
          postedAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white border border-gray-200 p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{ann.title}</h3>
                  <span className="text-xs text-gray-400">{ann.date}</span>
                </div>
                <p className="text-gray-700 text-sm mb-2">{ann.message}</p>
                <div className="text-xs text-gray-500">
                  Sent To: {ann.target.join(", ")}
                </div>
              </div>

              <div className="flex gap-3 mt-4 md:mt-0">
                <button
                  onClick={() => handleEdit(ann.id)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:underline"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
