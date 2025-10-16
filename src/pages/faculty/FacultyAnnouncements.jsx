import { useState } from "react";
import { Megaphone, PlusCircle } from "lucide-react";

const FacultyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([
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
      sender: "Chancellor",
      role: "Chancellor",
      message: "University will remain closed on Eid holidays.",
      date: "2025-06-23",
    },
  ]);

  const [teacherMessage, setTeacherMessage] = useState("");
  const [posted, setPosted] = useState([]);

  const handlePost = () => {
    if (!teacherMessage.trim()) return;
    const newAnnouncement = {
      id: Date.now(),
      sender: "You",
      role: "Faculty",
      message: teacherMessage,
      date: new Date().toISOString().split("T")[0],
    };
    setPosted([newAnnouncement, ...posted]);
    setTeacherMessage("");
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-8 bg-gradient-to-br from-gray-50 to-indigo-50/40 shadow-lg rounded-2xl border border-gray-100 space-y-10">
      {/* Header */}
      <h2 className="text-3xl font-bold flex items-center gap-3 text-indigo-700 tracking-tight">
        <Megaphone className="text-indigo-600" size={28} />
        Faculty Announcements
      </h2>

      {/* 🔔 Received Announcements */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-5 border-b border-gray-200 pb-2">
          From VC, Chairman & Chancellor
        </h3>
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="relative border border-gray-100 bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-5"
            >
              <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl bg-gradient-to-b from-indigo-500 to-purple-600"></div>
              <div className="ml-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {a.date} • <span className="font-medium">{a.role}</span>
                  </p>
                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
                    {a.sender}
                  </span>
                </div>
                <p className="mt-2 text-gray-800 text-[15px] leading-relaxed">
                  {a.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📢 Faculty's Own Announcements */}
      <div className="pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Make Announcement for Students
        </h3>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <textarea
            value={teacherMessage}
            onChange={(e) => setTeacherMessage(e.target.value)}
            rows={3}
            placeholder="Type your announcement here..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm text-gray-700"
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={handlePost}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <PlusCircle size={18} />
              Post Announcement
            </button>
          </div>
        </div>

        {posted.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <Megaphone className="text-purple-600" size={18} /> Your Announcements
            </h4>
            <div className="space-y-4">
              {posted.map((a) => (
                <div
                  key={a.id}
                  className="relative bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-purple-500 rounded-l-xl"></div>
                  <p className="text-sm text-gray-500">{a.date}</p>
                  <p className="mt-1 text-gray-800">{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyAnnouncements;
