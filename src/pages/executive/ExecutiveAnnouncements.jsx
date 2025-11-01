import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
// Later we’ll import firebase functions here

export default function ExecutiveAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState("all");

  // Temporary local data (replace with Firestore later)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("executiveAnnouncements")) || [];
    setAnnouncements(stored);
  }, []);

  const handleAddAnnouncement = (e) => {
    e.preventDefault();

    if (!title || !message) return;

    const newAnnouncement = {
      id: Date.now(),
      title,
      message,
      visibility,
      date: new Date().toLocaleString(),
    };

    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem("executiveAnnouncements", JSON.stringify(updated));

    setTitle("");
    setMessage("");
    setVisibility("all");
  };

  const handleDelete = (id) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem("executiveAnnouncements", JSON.stringify(updated));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Executive Announcements
      </h1>

      {/* Create Announcement */}
      <form
        onSubmit={handleAddAnnouncement}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>

        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Announcement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <textarea
            placeholder="Enter announcement message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
            required
          />

          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Users</option>
            <option value="faculty">Faculty Only</option>
            <option value="students">Students Only</option>
            <option value="chairs">Chairpersons Only</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition duration-300"
          >
            <Plus size={18} /> Post Announcement
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Announcements</h2>

        {announcements.length === 0 ? (
          <p className="text-gray-500 text-center">No announcements yet.</p>
        ) : (
          <ul className="space-y-4">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="border p-4 rounded-md flex justify-between items-start hover:bg-gray-50"
              >
                <div>
                  <h3 className="text-lg font-semibold text-blue-700">
                    {a.title}
                  </h3>
                  <p className="text-gray-700">{a.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {a.date} • Visibility:{" "}
                    <span className="font-medium">{a.visibility}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
