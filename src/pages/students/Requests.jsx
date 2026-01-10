import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, 
  ArrowLeft, 
  PlusCircle, 
  Edit2, 
  X, 
  Clock, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";

export default function Requests() {
  const [view, setView] = useState("view");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [applicationText, setApplicationText] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("student_token");
      const response = await axios.get("http://localhost:5000/requests/student-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError(err.response?.data?.error || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!type || !description.trim() || !applicationText.trim()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("student_token");
      await axios.post(
        "http://localhost:5000/requests/student-requests",
        {
          request_type: type,
          title: description,
          description: applicationText,
          priority: "medium",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reset form and refresh requests
      setType("");
      setDescription("");
      setApplicationText("");
      setView("view");
      await fetchRequests();
    } catch (err) {
      console.error("Failed to submit request:", err);
      setError(err.response?.data?.error || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    const req = requests[index];
    setType(req.request_type);
    setDescription(req.title);
    setApplicationText(req.description);
    setView("create");
  };

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem("student_token");
      await axios.patch(
        `http://localhost:5000/requests/student-requests/${id}`,
        { status: "cancelled" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchRequests();
    } catch (err) {
      console.error("Failed to cancel request:", err);
      setError(err.response?.data?.error || "Failed to cancel request");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText size={24} />
            {view === "create" ? "Create New Request" : "My Requests"}
          </h2>
          <button
            onClick={() => {
              setView(view === "create" ? "view" : "create");
              setType("");
              setDescription("");
              setApplicationText("");
              setError("");
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
          >
            {view === "create" ? (
              <>
                <ArrowLeft size={18} />
                Back to Requests
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                New Request
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {view === "create" ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              >
                <option value="">Select request type</option>
                <option value="COURSE_ADD_DROP">Course Add/Drop</option>
                <option value="Semester Freeze">Semester Freeze</option>
                <option value="LEAVE">Leave Request</option>
                <option value="ATTENDANCE_CORRECTION">Attendance Correction</option>
                <option value="TRANSCRIPT">Transcript Request</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brief Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Briefly describe your request..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Application</label>
              <textarea
                rows="5"
                value={applicationText}
                onChange={(e) => setApplicationText(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Provide all necessary details for your request..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setView("view");
                  setType("");
                  setDescription("");
                  setApplicationText("");
                  setError("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !type || !description.trim() || !applicationText.trim()}
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                  loading || !type || !description.trim() || !applicationText.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                }`}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No requests yet</h3>
            <p className="text-gray-500 mb-4">You haven't submitted any requests yet</p>
            <button
              onClick={() => setView("create")}
              className="flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
            >
              <PlusCircle size={18} />
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loading && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            )}
            {!loading && requests.map((req) => {
              const REQUEST_TYPE_LABELS = {
                COURSE_ADD_DROP: "Course Add/Drop",
                LEAVE: "Leave Request",
                ATTENDANCE_CORRECTION: "Attendance Correction",
                TRANSCRIPT: "Transcript Request",
                OTHER: "Other",
              };
              
              return (
              <div 
                key={req.id} 
                className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {REQUEST_TYPE_LABELS[req.request_type] || req.request_type}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>ID: {req.id.slice(0, 8)}</span>
                      <span>•</span>
                      <span>{new Date(req.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    req.status === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : req.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : req.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Title:</span> {req.title}
                  </p>
                  {req.description && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Details</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{req.description}</p>
                  </div>
                  )}
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="flex items-center gap-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition"
                    >
                      <X size={16} />
                      Cancel Request
                    </button>
                  </div>
                )}

                {req.status === "approved" && req.resolution_note && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-xs font-medium text-green-700 uppercase mb-1">✓ Approval Note</h4>
                    <p className="text-sm text-gray-700">{req.resolution_note}</p>
                  </div>
                )}

                {req.status === "rejected" && req.resolution_note && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-xs font-medium text-red-700 uppercase mb-1">✗ Rejection Reason</h4>
                    <p className="text-sm text-gray-700">{req.resolution_note}</p>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}