import { useState } from "react";
import { Bell, Calendar, PlusCircle, Send } from "lucide-react";

export default function CoordinatorAnnouncements() {
  const initialAnnouncements = [
    {
      id: "ANN-3201",
      title: "Mid-Semester Result Timeline",
      audience: "Faculty",
      department: "Computer Science",
      publishDate: "2025-11-28",
      status: "Scheduled",
      message:
        "Please finalize all internal assessment marks by 28 Nov so coordinator can consolidate results for the controller office.",
    },
    {
      id: "ANN-3198",
      title: "Industrial Visit Coordination",
      audience: "Students",
      department: "Software Engineering",
      publishDate: "2025-11-18",
      status: "Published",
      message:
        "Final bus rosters have been shared with class representatives. Carry your student ID cards and submit undertakings by Friday.",
    },
    {
      id: "ANN-3190",
      title: "Lab Hardware Maintenance",
      audience: "Faculty & Lab Staff",
      department: "Electrical Engineering",
      publishDate: "2025-11-05",
      status: "Published",
      message:
        "EE lab 2 will remain closed on Wednesday for UPS replacement. Please reschedule pending lab evaluations.",
    },
  ];

  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [filters, setFilters] = useState({ audience: "All", status: "All" });
  const [formData, setFormData] = useState({
    title: "",
    audience: "All",
    department: "",
    publishDate: "",
    message: "",
  });

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesAudience = filters.audience === "All" || item.audience === filters.audience;
    const matchesStatus = filters.status === "All" || item.status === filters.status;
    return matchesAudience && matchesStatus;
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    const newAnnouncement = {
      id: `ANN-${Math.floor(Math.random() * 10000)}`,
      title: formData.title.trim(),
      audience: formData.audience,
      department: formData.department.trim() || "All Departments",
      publishDate: formData.publishDate || new Date().toISOString().slice(0, 10),
      status:
        new Date(formData.publishDate) > new Date() && formData.publishDate
          ? "Scheduled"
          : "Published",
      message: formData.message.trim(),
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setFormData({ title: "", audience: "All", department: "", publishDate: "", message: "" });
  };

  const toggleStatus = (id) => {
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Published" ? "Archived" : "Published" }
          : item
      )
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
          <p className="text-gray-500">
            Schedule updates for faculty, students, and departments from a single view.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={filters.audience}
            onChange={(e) => setFilters((prev) => ({ ...prev, audience: e.target.value }))}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600"
          >
            <option value="All">All Audiences</option>
            <option value="Faculty">Faculty</option>
            <option value="Students">Students</option>
            <option value="Faculty & Lab Staff">Faculty & Lab Staff</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 && (
            <p className="p-6 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
              No announcements match the current filters.
            </p>
          )}

          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl shadow border border-gray-100 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase text-gray-400">{ann.id}</p>
                  <h3 className="text-lg font-bold text-gray-800">{ann.title}</h3>
                  <p className="text-sm text-gray-500">{ann.department}</p>
                </div>
                <div className="text-right space-y-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <Calendar size={14} /> {ann.publishDate}
                  </span>
                  <StatusChip value={ann.status} />
                </div>
              </div>
              <p className="text-sm text-gray-600">{ann.message}</p>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <Bell size={14} /> Audience: {ann.audience}
                </span>
                <button
                  onClick={() => toggleStatus(ann.id)}
                  className="px-3 py-1 rounded-full border border-gray-200 hover:border-orange-500 hover:text-orange-600 transition"
                >
                  {ann.status === "Published" ? "Archive" : "Publish now"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <PlusCircle className="text-orange-600" size={20} />
            <div>
              <p className="text-xl font-semibold text-gray-800">Create Announcement</p>
              <p className="text-sm text-gray-500">Draft, schedule, or publish instantly.</p>
            </div>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g. Result compilation timeline"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Audience</label>
                <select
                  name="audience"
                  value={formData.audience}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="All">All Users</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Students">Students</option>
                  <option value="Faculty & Lab Staff">Faculty & Lab Staff</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Department (optional)</label>
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Publish Date</label>
              <input
                type="date"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleFormChange}
                rows={4}
                placeholder="Share the important details, timelines, or links..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl shadow hover:bg-orange-700 transition"
            >
              <Send size={16} /> Publish Announcement
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ value }) {
  const styles = {
    Published: "bg-green-100 text-green-700",
    Scheduled: "bg-indigo-100 text-indigo-700",
    Archived: "bg-gray-100 text-gray-600",
  }[value] || "bg-gray-100 text-gray-600";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>{value}</span>;
}

