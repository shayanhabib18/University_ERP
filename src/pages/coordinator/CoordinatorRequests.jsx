import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, 
  Eye,
  X, 
  CheckCircle,
  Trash2,
  Plus,
} from "lucide-react";

const REQUEST_TYPE_LABELS = {
  COURSE_ADD_DROP: "📚 Course Add/Drop",
  LEAVE: "📋 Leave Request",
  ATTENDANCE_CORRECTION: "✓ Attendance Correction",
  TRANSCRIPT: "📄 Transcript Request",
  OTHER: "📝 General Request",
};

export default function CoordinatorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    requestType: "OTHER",
    description: "",
    recipients: {
      admin: false,
      faculty: false,
      deptChair: false,
      executive: false,
    },
  });

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("facultyToken");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }
      
      const url = filterStatus === "all" 
        ? "http://localhost:5000/requests/coordinator/requests"
        : `http://localhost:5000/requests/coordinator/requests?status=${filterStatus}`;
      
      const response = await axios.get(url, {
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

  const handleViewDetails = async (requestId) => {
    try {
      const token = localStorage.getItem("facultyToken");
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }
      const response = await axios.get(
        `http://localhost:5000/requests/coordinator/requests/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedRequest(response.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch request details:", err);
      setError(err.response?.data?.error || "Failed to load request details");
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedRequest || !selectedRequest.request) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("facultyToken");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setActionLoading(false);
        return;
      }
      
      // Determine final status based on checkboxes
      let finalStatus = status;
      if (selectedRequest.forwardToAdmin) {
        finalStatus = "forwarded_to_admin";
      } else if (selectedRequest.forwardToDeptChair) {
        finalStatus = "forwarded_to_chair";
      }
      
      await axios.patch(
        `http://localhost:5000/requests/coordinator/requests/${selectedRequest.request.id}`,
        {
          status: finalStatus,
          resolution_note: resolutionNote || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setShowModal(false);
      setSelectedRequest(null);
      setResolutionNote("");
      await fetchRequests();
    } catch (err) {
      console.error("Failed to update request:", err);
      setError(err.response?.data?.error || "Failed to update request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("facultyToken");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setActionLoading(false);
        return;
      }

      await axios.delete(
        `http://localhost:5000/requests/coordinator/requests/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowModal(false);
      setSelectedRequest(null);
      setResolutionNote("");
      await fetchRequests();
    } catch (err) {
      console.error("Failed to delete request:", err);
      setError(err.response?.data?.error || "Failed to delete request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.title || !newRequest.description) {
      setError("Please fill in all required fields");
      return;
    }

    const selectedRecipients = Object.keys(newRequest.recipients).filter(
      key => newRequest.recipients[key]
    );

    if (selectedRecipients.length === 0) {
      setError("Please select at least one recipient");
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("facultyToken");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setActionLoading(false);
        return;
      }

      await axios.post(
        "http://localhost:5000/requests/coordinator/create-request",
        {
          title: newRequest.title,
          request_type: newRequest.requestType,
          description: newRequest.description,
          recipients: newRequest.recipients,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowCreateModal(false);
      setNewRequest({ 
        title: "", 
        requestType: "OTHER", 
        description: "",
        recipients: {
          admin: false,
          faculty: false,
          deptChair: false,
          executive: false,
        },
      });
      await fetchRequests();
    } catch (err) {
      console.error("Failed to create request:", err);
      setError(err.response?.data?.error || "Failed to create request");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">📬 Requests</h1>
          <p className="text-gray-600">Review and manage student requests for your department</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Create Request
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filterStatus === "all"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus("pending")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filterStatus === "pending"
              ? "bg-yellow-500 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ⏳ Pending
        </button>
        <button
          onClick={() => setFilterStatus("under_review")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filterStatus === "under_review"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          👀 Under Review
        </button>
        <button
          onClick={() => setFilterStatus("approved")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filterStatus === "approved"
              ? "bg-green-500 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ✅ Approved
        </button>
        <button
          onClick={() => setFilterStatus("rejected")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filterStatus === "rejected"
              ? "bg-red-500 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ❌ Rejected
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600 text-lg">
            {filterStatus === "all" ? "No requests found" : `No ${filterStatus} requests`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-indigo-500 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {REQUEST_TYPE_LABELS[req.request_type] || req.request_type}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      req.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : req.status === "under_review"
                        ? "bg-blue-100 text-blue-800"
                        : req.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : req.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {req.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-2 font-medium">{req.title}</p>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div>👤 <span className="font-medium">{req.student_name}</span></div>
                    <div>🎓 {req.roll_number}</div>
                    <div>📅 {formatDate(req.created_at)}</div>
                    <div>📧 {req.personal_email}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(req.id)}
                  className="ml-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all flex items-center gap-2"
                >
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Request Details */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Request Details</h2>
                  <p className="text-indigo-100">
                    {REQUEST_TYPE_LABELS[selectedRequest.request.request_type] || selectedRequest.request.request_type}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                    setResolutionNote("");
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Details */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Request Title</h3>
                <p className="text-gray-800">{selectedRequest.request.title}</p>
              </div>

              {selectedRequest.request.description && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedRequest.request.description}</p>
                </div>
              )}

              {/* Action Section */}
              {selectedRequest.request.status === "pending" && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-700 mb-3">Take Action</h3>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Add a note or reason for your decision (optional)"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-4"
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus("approved")}
                      disabled={actionLoading}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      {actionLoading ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("rejected")}
                      disabled={actionLoading}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <X size={20} />
                      {actionLoading ? "Processing..." : "Reject"}
                    </button>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteRequest(selectedRequest.request.id)}
                    disabled={actionLoading}
                    className="w-full mt-3 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={20} />
                    {actionLoading ? "Deleting..." : "Delete Request"}
                  </button>
                </div>
              )}

              {/* Resolution Note (for completed requests) */}
              {selectedRequest.request.resolution_note && (
                <div className={`p-4 rounded-lg border-l-4 ${
                  selectedRequest.request.status === "approved"
                    ? "bg-green-50 border-green-400"
                    : "bg-red-50 border-red-400"
                }`}>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {selectedRequest.request.status === "approved" ? "✓ Approval Note" : "✗ Rejection Reason"}
                  </h3>
                  <p className="text-gray-700">{selectedRequest.request.resolution_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-700">Create New Request</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRequest({ 
                    title: "", 
                    requestType: "OTHER", 
                    description: "",
                    recipients: {
                      admin: false,
                      faculty: false,
                      deptChair: false,
                      executive: false,
                    },
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Enter request title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRequest.requestType}
                  onChange={(e) => setNewRequest({ ...newRequest, requestType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="COURSE_ADD_DROP">Course Add/Drop</option>
                  <option value="LEAVE">Leave Request</option>
                  <option value="ATTENDANCE_CORRECTION">Attendance Correction</option>
                  <option value="TRANSCRIPT">Transcript Request</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Enter request description"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Send To <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRequest.recipients.admin}
                      onChange={(e) => setNewRequest({
                        ...newRequest,
                        recipients: { ...newRequest.recipients, admin: e.target.checked }
                      })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Admin</span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRequest.recipients.faculty}
                      onChange={(e) => setNewRequest({
                        ...newRequest,
                        recipients: { ...newRequest.recipients, faculty: e.target.checked }
                      })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Faculty</span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRequest.recipients.deptChair}
                      onChange={(e) => setNewRequest({
                        ...newRequest,
                        recipients: { ...newRequest.recipients, deptChair: e.target.checked }
                      })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Dept Chair</span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRequest.recipients.executive}
                      onChange={(e) => setNewRequest({
                        ...newRequest,
                        recipients: { ...newRequest.recipients, executive: e.target.checked }
                      })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Executive</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateRequest}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Create Request"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRequest({ 
                      title: "", 
                      requestType: "OTHER", 
                      description: "",
                      recipients: {
                        admin: false,
                        faculty: false,
                        deptChair: false,
                        executive: false,
                      },
                    });
                  }}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
