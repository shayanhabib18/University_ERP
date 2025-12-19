import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Megaphone, 
  FileText, 
  Users, 
  GraduationCap, 
  UserCog,
  Calendar,
  Eye,
  X,
  CheckCircle
} from "lucide-react";

export default function ExecutiveAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState("coordinator");

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
      date: new Date().toISOString(),
      status: "active",
    };

    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem("executiveAnnouncements", JSON.stringify(updated));

    setTitle("");
    setMessage("");
    setVisibility("coordinator");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      const updated = announcements.filter((a) => a.id !== id);
      setAnnouncements(updated);
      localStorage.setItem("executiveAnnouncements", JSON.stringify(updated));
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid date
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString; // Return original if error
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "coordinator":
        return <UserCog className="text-purple-600" size={16} />;
      case "chairperson":
        return <Users className="text-orange-600" size={16} />;
      case "admin":
        return <Users className="text-red-600" size={16} />;
      default:
        return <Eye className="text-gray-600" size={16} />;
    }
  };

  const getVisibilityBadgeColor = (visibility) => {
    switch (visibility) {
      case "coordinator":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "chairperson":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-xl shadow-lg">
            <Megaphone className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Executive Announcements
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Create and manage institutional announcements
            </p>
          </div>
        </div>
      </div>

      {/* Create Announcement */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="text-blue-600" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create New Announcement</h2>
        </div>

        <form onSubmit={handleAddAnnouncement} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Announcement Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter a clear and descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Announcement Message <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter the full announcement message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Visibility <span className="text-red-500">*</span>
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="coordinator">Coordinator Only</option>
              <option value="chairperson">Chairperson Only</option>
              <option value="admin">Admin Only</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            <Plus size={20} />
            Post Announcement
          </button>
        </form>
      </div>

      {/* Announcements List */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Megaphone className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">All Announcements</h2>
              <p className="text-sm text-gray-600">
                {announcements.length} {announcements.length === 1 ? 'announcement' : 'announcements'} total
              </p>
            </div>
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Announcements Yet</h3>
            <p className="text-gray-500">
              Create your first announcement to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="border-2 border-gray-200 p-6 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all bg-white group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
                        {a.title}
                      </h3>
                      {a.status === "active" && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold">
                          <CheckCircle size={12} />
                          Active
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
                      {a.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">{formatDate(a.date)}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getVisibilityBadgeColor(a.visibility)}`}>
                        {getVisibilityIcon(a.visibility)}
                        <span className="capitalize">{a.visibility === "all" ? "All Users" : a.visibility}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Announcement"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
