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
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-10">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">
        <Megaphone /> Announcements
      </h2>

      {/* 🔔 Received Announcements */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          From VC, Chairman & Chancellor
        </h3>
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="border-l-4 pl-4 py-2 border-indigo-500 bg-gray-50 rounded"
            >
              <p className="text-sm text-gray-500">{a.date} - {a.role}</p>
              <p className="font-medium text-gray-800">{a.message}</p>
              <p className="text-xs text-gray-400">~ {a.sender}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 📢 Faculty's Own Announcements */}
      <div className="pt-6 border-t">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Make Announcement for Students
        </h3>

        <textarea
          value={teacherMessage}
          onChange={(e) => setTeacherMessage(e.target.value)}
          rows={3}
          placeholder="Type your announcement here..."
          className="w-full p-2 border rounded mb-3"
        />

        <button
          onClick={handlePost}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <PlusCircle size={18} /> Post Announcement
        </button>

        {posted.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-700">Your Announcements</h4>
            <div className="space-y-3">
              {posted.map((a) => (
                <div
                  key={a.id}
                  className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded"
                >
                  <p className="text-sm text-gray-500">{a.date}</p>
                  <p className="text-gray-800">{a.message}</p>
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
