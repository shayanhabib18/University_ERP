import React, { useState } from "react";
import { Megaphone, Send } from "lucide-react";

const roles = ["Students", "Faculty", "Chairman", "VC", "Chancellor"];

export default function AdminAnnouncements() {
  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
    target: [],
  });

  const [postedAnnouncements, setPostedAnnouncements] = useState([]);

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
    if (
      !announcement.title ||
      !announcement.message ||
      announcement.target.length === 0
    ) {
      return alert(
        "Please fill all fields and select at least one target group."
      );
    }

    const newAnnouncement = {
      ...announcement,
      id: Date.now(),
      date: new Date().toLocaleString(),
    };

    setPostedAnnouncements([newAnnouncement, ...postedAnnouncements]);

    setAnnouncement({
      title: "",
      message: "",
      target: [],
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2 mb-4">
          <Megaphone size={24} />
          Admin Announcement
        </h2>

        <input
          type="text"
          placeholder="Announcement Title"
          value={announcement.title}
          onChange={(e) =>
            setAnnouncement({ ...announcement, title: e.target.value })
          }
          className="w-full border rounded p-2 mb-4"
        />

        <textarea
          placeholder="Write your announcement message here..."
          value={announcement.message}
          onChange={(e) =>
            setAnnouncement({ ...announcement, message: e.target.value })
          }
          rows={4}
          className="w-full border rounded p-2 mb-4"
        />

        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Target Audience:</h4>
          <div className="flex flex-wrap gap-4">
            {roles.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={announcement.target.includes(role)}
                  onChange={() => handleCheckboxChange(role)}
                  className="accent-indigo-600"
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
        >
          <Send size={16} />
          Post Announcement
        </button>
      </div>

      {/* Display Posted Announcements */}
      <div className="space-y-4">
        {postedAnnouncements.length === 0 ? (
          <p className="text-gray-500 text-sm">No announcements posted yet.</p>
        ) : (
          postedAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {ann.title}
                </h3>
                <span className="text-xs text-gray-400">{ann.date}</span>
              </div>
              <p className="text-gray-700 text-sm mb-2">{ann.message}</p>
              <div className="text-xs text-gray-500">
                Sent To: {ann.target.join(", ")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
