import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
  const [editIndex, setEditIndex] = useState(null);

  const handleSubmit = () => {
    if (!type || !description.trim() || !applicationText.trim()) return;

    const newRequest = {
      id: uuidv4().split("-")[0].toUpperCase(),
      type,
      description,
      applicationText,
      status: "Pending",
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
    };

    if (editIndex !== null) {
      const updated = [...requests];
      updated[editIndex] = { ...updated[editIndex], ...newRequest };
      setRequests(updated);
      setEditIndex(null);
    } else {
      setRequests([...requests, newRequest]);
    }

    // Reset form
    setType("");
    setDescription("");
    setApplicationText("");
    setView("view");
  };

  const handleEdit = (index) => {
    const req = requests[index];
    setType(req.type);
    setDescription(req.description);
    setApplicationText(req.applicationText);
    setEditIndex(index);
    setView("create");
  };

  const handleCancel = (index) => {
    const updated = [...requests];
    updated[index].status = "Cancelled";
    setRequests(updated);
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
              setEditIndex(null);
              setType("");
              setDescription("");
              setApplicationText("");
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
                <option value="Semester Freeze">Semester Freeze</option>
                <option value="Course Add/Drop">Course Add/Drop</option>
                <option value="Grade Appeal">Grade Appeal</option>
                <option value="Financial Aid">Financial Aid</option>
                <option value="Other">Other</option>
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

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setView("view");
                  setEditIndex(null);
                  setType("");
                  setDescription("");
                  setApplicationText("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!type || !description.trim() || !applicationText.trim()}
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                  !type || !description.trim() || !applicationText.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                }`}
              >
                {editIndex !== null ? "Update Request" : "Submit Request"}
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
            {requests.map((req, idx) => (
              <div 
                key={idx} 
                className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{req.type}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>ID: {req.id}</span>
                      <span>•</span>
                      <span>{req.date}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.status === "Pending"
                      ? "bg-amber-100 text-amber-800"
                      : req.status === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Description:</span> {req.description}
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Full Application</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{req.applicationText}</p>
                  </div>
                </div>

                {req.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(idx)}
                      className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancel(idx)}
                      className="flex items-center gap-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}

                {req.status !== "Pending" && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {req.status === "Approved" ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <AlertCircle className="text-red-500" size={16} />
                    )}
                    <span>This request has been {req.status.toLowerCase()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}