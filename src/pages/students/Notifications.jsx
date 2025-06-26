// src/pages/Notifications.jsx
import { useState } from "react";

export default function Notifications() {
  const [filter, setFilter] = useState("All");

  const notifications = [
    {
      id: 1,
      title: "Midterm Schedule Released",
      sender: "Admin",
      timestamp: "2025-06-24 09:30 AM",
      message: "Midterm exams will start from July 5. Please download the timetable from the portal.",
    },
    {
      id: 2,
      title: "Seminar on AI Ethics",
      sender: "Chairman",
      timestamp: "2025-06-22 02:00 PM",
      message: "All CS students are invited to attend a seminar on AI Ethics on June 30 in Hall B.",
    },
    {
      id: 3,
      title: "Class Cancelled",
      sender: "Faculty",
      timestamp: "2025-06-21 08:15 AM",
      message: "Today's Compiler Design (CS3502) class is cancelled due to unavoidable circumstances.",
    },
    {
      id: 4,
      title: "Convocation Date Announced",
      sender: "VC",
      timestamp: "2025-06-18 11:45 AM",
      message: "The annual convocation will be held on August 25. Register on the portal by July 15.",
    }
  ];

  const filtered = filter === "All"
    ? notifications
    : notifications.filter((n) => n.sender === filter);

  const senderTypes = ["All", "Admin", "Faculty", "Chairman", "VC"];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">🔔 Notifications</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        {senderTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === type
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No notifications available.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-semibold text-indigo-700">{note.title}</h3>
                <span className="text-xs text-gray-500">{note.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700">{note.message}</p>
              <p className="text-xs mt-2 text-gray-500 italic">Posted by: {note.sender}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
