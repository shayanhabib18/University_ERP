import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  FilePlus,
  Send,
  Clock,
  Search,
  Trash2,
  Pencil,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "faculty.requests";

const STATUS = {
  Pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  Approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700" },
  Rejected: { label: "Rejected", color: "bg-rose-100 text-rose-700" },
};

const REQUEST_TYPES = [
  { key: "Leave", icon: <ClipboardList size={18} />, hint: "Casual/medical/annual leave" },
  { key: "Resource", icon: <ClipboardList size={18} />, hint: "Room, equipment, lab access" },
  { key: "Schedule Change", icon: <ClipboardList size={18} />, hint: "Class or exam reschedule" },
  { key: "Grade Review", icon: <ClipboardList size={18} />, hint: "Student grade reconsideration" },
  { key: "Other", icon: <ClipboardList size={18} />, hint: "Anything else" },
];

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.Pending;
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>;
}

export default function FacultyRequests() {
  const [requests, setRequests] = useState([]);
  const [type, setType] = useState("Leave");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [query, setQuery] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState("Leave");
  const [editTitle, setEditTitle] = useState("");
  const [editDetails, setEditDetails] = useState("");

  // Load saved requests
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRequests(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch {}
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const queryOK = !query || r.title.toLowerCase().includes(query.toLowerCase());
      return queryOK;
    });
  }, [requests, query]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;
    const newReq = {
      id: uuidv4(),
      type,
      title: title.trim(),
      details: details.trim(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);
    setTitle("");
    setDetails("");
    setType("Leave");
  }

  function deleteRequest(id) {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  function startEdit(r) {
    setEditingId(r.id);
    setEditType(r.type);
    setEditTitle(r.title);
    setEditDetails(r.details);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditType("Leave");
    setEditTitle("");
    setEditDetails("");
  }

  function saveEdit() {
    if (!editingId) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === editingId ? { ...r, type: editType, title: editTitle.trim(), details: editDetails.trim() } : r))
    );
    cancelEdit();
  }

  return (
    <div className="space-y-8 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600 text-white shadow">
            <FilePlus size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Faculty Requests</h1>
            <p className="text-gray-500 text-sm">Submit and track approvals</p>
          </div>
        </div>
        <div className="relative w-56">
          <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
          <input
            className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Submit Form */}
      <div className="bg-white border shadow-sm rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ClipboardList size={18} className="text-indigo-600" /> Submit a Request
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Request Type</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>{t.key}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {REQUEST_TYPES.find((t) => t.key === type)?.hint}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600">Title</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Short summary of your request"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Details</label>
            <textarea
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="Provide clear context, dates, and any references"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <div className="flex items-end justify-start">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
            >
              <Send size={16} /> Submit Request
            </button>
          </div>
        </form>
      </div>

      {/* Requests List */}
      <div className="bg-white border shadow-sm rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-amber-600" /> My Requests
        </h2>
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No requests yet. Submit one above.
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((r) => (
              <li key={r.id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <span className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    {editingId === r.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm text-gray-600">Request Type</label>
                            <select className="mt-1 w-full border rounded-lg px-3 py-2" value={editType} onChange={(e) => setEditType(e.target.value)}>
                              {REQUEST_TYPES.map((t) => (
                                <option key={t.key} value={t.key}>{t.key}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-sm text-gray-600">Title</label>
                            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Details</label>
                          <textarea rows={3} className="mt-1 w-full border rounded-lg px-3 py-2" value={editDetails} onChange={(e) => setEditDetails(e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-gray-800">{r.title}</p>
                        <p className="text-sm text-gray-600">Type: {r.type}</p>
                        <p className="text-sm text-gray-500 line-clamp-3">{r.details}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === r.id ? (
                      <>
                        <button onClick={saveEdit} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow">
                          Save
                        </button>
                        <button onClick={cancelEdit} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(r)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border"
                          title="Edit request"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                        <button
                          onClick={() => deleteRequest(r.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border"
                          title="Delete"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
