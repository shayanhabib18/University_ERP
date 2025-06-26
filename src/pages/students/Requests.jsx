import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Requests() {
  const [view, setView] = useState("create");
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
      date: new Date().toLocaleDateString(),
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
    <div className="bg-white max-w-3xl mx-auto p-6 rounded-xl shadow">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">
          {view === "create" ? "📝 Create Request" : "📋 My Requests"}
        </h2>
        <button
          onClick={() => {
            setView(view === "create" ? "view" : "create");
            setEditIndex(null);
            setType("");
            setDescription("");
            setApplicationText("");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {view === "create" ? "View Requests" : "Create Request"}
        </button>
      </div>

      {view === "create" ? (
        <>
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Request Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border p-2 rounded focus:outline-none"
            >
              <option value="">-- Select --</option>
              <option value="Semester Freeze">Semester Freeze</option>
              <option value="Course Add/Drop">Course Add/Drop</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Short Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded focus:outline-none"
              placeholder="e.g., I want to drop one course due to clash in schedule."
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Application (Detailed Reason)</label>
            <textarea
              rows="5"
              value={applicationText}
              onChange={(e) => setApplicationText(e.target.value)}
              className="w-full border p-2 rounded focus:outline-none"
              placeholder="Write a formal application explaining your reason..."
            ></textarea>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {editIndex !== null ? "Update Request" : "Submit Request"}
          </button>
        </>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No requests submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req, idx) => (
            <div key={idx} className="border rounded p-4 bg-gray-50 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">ID: {req.id}</div>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    req.status === "Pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : req.status === "Cancelled"
                      ? "bg-red-200 text-red-700"
                      : "bg-green-200 text-green-700"
                  }`}
                >
                  {req.status}
                </div>
              </div>
              <div className="text-base font-medium text-indigo-700">{req.type}</div>
              <div className="text-sm text-gray-500 mb-2">{req.date}</div>
              <div className="text-sm text-gray-800 mb-1">
                <strong>Description:</strong> {req.description}
              </div>
              <div className="text-sm text-gray-800 mb-3">
                <strong>Application:</strong>
                <pre className="whitespace-pre-wrap font-sans mt-1 bg-white p-2 rounded border">
                  {req.applicationText}
                </pre>
              </div>
              <div className="flex gap-2">
                {req.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleEdit(idx)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit Request
                    </button>
                    <button
                      onClick={() => handleCancel(idx)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Cancel Request
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
