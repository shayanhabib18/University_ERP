import { useState } from "react";
import { Megaphone } from "lucide-react";

const FacultyAnnouncements = () => {
  const [filter, setFilter] = useState("All");

  const receivedAnnouncements = [
    {
      id: 1,
      sender: "Vice Chancellor",
      role: "VC",
      message: "Final exam schedule has been released.",
      date: "2025-06-24",
    },
    {
      id: 2,
      sender: "Chairman",
      role: "Chairman",
      message: "Department meeting on 28th June at 11 AM.",
      date: "2025-06-25",
    },
    {
      id: 3,
      sender: "",
      role: "Co-ordinator",
      message: "University will remain closed on Eid holidays.",
      date: "2025-06-23",
    },
  ];

  const filterOptions = ["All", "VC", "Chairman", "Chancellor"];

  const filtered = filter === "All"
    ? receivedAnnouncements
    : receivedAnnouncements.filter((a) => a.role === filter);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-10">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">
        <Megaphone /> Announcements
      </h2>

      {/* 🔍 Filter Buttons */}
      <div className="flex gap-3 flex-wrap mb-6">
        {filterOptions.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition ${
              filter === type
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 🔔 VC/Chairman/Chancellor Announcements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Official Announcements
        </h3>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No announcements found.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="border-l-4 pl-4 py-3 border-indigo-500 bg-gray-50 rounded"
              >
                <p className="text-sm text-gray-500">{a.date} · {a.role}</p>
                <p className="font-medium text-gray-900">{a.message}</p>
                <p className="text-xs text-gray-400 mt-1">~ {a.sender}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyAnnouncements;
