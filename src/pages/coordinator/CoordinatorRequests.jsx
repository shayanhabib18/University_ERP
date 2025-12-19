import { useState } from "react";
import { Send, Trash2, Inbox, Plus, CheckCircle, Clock, Users } from "lucide-react";

export default function CoordinatorRequests() {
  const [activeTab, setActiveTab] = useState("create");
  const [requests, setRequests] = useState([
    {
      id: 1,
      title: "Course Material Update",
      message: "Request to update course materials for BBA-301",
      visibleTo: ["chairman", "faculty"],
      date: "2025-10-20",
      type: "sent",
      status: "Pending",
    },
    {
      id: 2,
      title: "Resource Allocation",
      message: "Request for additional computer lab resources",
      visibleTo: ["executive"],
      date: "2025-10-15",
      type: "received",
      sender: "Chairman",
      status: "Approved",
    },
  ]);

  const [newRequest, setNewRequest] = useState({
    title: "",
    message: "",
    visibleTo: [],
  });

  const visibilityOptions = [
    { id: "chairman", label: "Chairman", color: "orange" },
    { id: "faculty", label: "Faculty", color: "purple" },
    { id: "executive", label: "Executive", color: "blue" },
    { id: "admin", label: "Admin", color: "red" },
  ];

  const handleAddRequest = () => {
    if (!newRequest.title || !newRequest.message || newRequest.visibleTo.length === 0) {
      return alert("Please fill in all fields and select at least one recipient!");
    }

    const request = {
      id: Date.now(),
      ...newRequest,
      date: new Date().toISOString().split("T")[0],
      type: "sent",
      status: "Pending",
    };

    setRequests([request, ...requests]);
    setNewRequest({ title: "", message: "", visibleTo: [] });
  };

  const handleToggleVisibility = (id) => {
    if (newRequest.visibleTo.includes(id)) {
      setNewRequest({
        ...newRequest,
        visibleTo: newRequest.visibleTo.filter((v) => v !== id),
      });
    } else {
      setNewRequest({
        ...newRequest,
        visibleTo: [...newRequest.visibleTo, id],
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      setRequests(requests.filter((r) => r.id !== id));
    }
  };

  const sentRequests = requests.filter((r) => r.type === "sent");
  const receivedRequests = requests.filter((r) => r.type === "received");

  const getVisibilityBadge = (visibleTo) => {
    return visibleTo.map((v) => {
      const option = visibilityOptions.find((o) => o.id === v);
      const colorMap = {
        orange: "bg-orange-100 text-orange-700",
        purple: "bg-purple-100 text-purple-700",
        blue: "bg-blue-100 text-blue-700",
        red: "bg-red-100 text-red-700",
      };
      return (
        <span key={v} className={`px-2 py-1 rounded text-xs font-semibold ${colorMap[option.color]}`}>
          {option.label}
        </span>
      );
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Inbox className="text-blue-600" /> Coordinator Requests
        </h1>

        {/* Tab Buttons */}
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "create"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-700 hover:bg-gray-100"
            }`}
          >
            Create Request
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "received"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-700 hover:bg-gray-100"
            }`}
          >
            Received Requests
          </button>
        </div>
      </div>

      {/* Create Request Section */}
      {activeTab === "create" && (
        <div className="bg-white p-6 rounded-2xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Request</h2>

          <div className="space-y-4 mb-4">
            <input
              type="text"
              placeholder="Request Title"
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newRequest.title}
              onChange={(e) =>
                setNewRequest({ ...newRequest, title: e.target.value })
              }
            />

            <textarea
              placeholder="Request Message"
              className="border p-3 rounded-lg w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={newRequest.message}
              onChange={(e) =>
                setNewRequest({ ...newRequest, message: e.target.value })
              }
            ></textarea>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Visible To (Select at least one)
              </label>
              <div className="space-y-2">
                {visibilityOptions.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRequest.visibleTo.includes(option.id)}
                      onChange={() => handleToggleVisibility(option.id)}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAddRequest}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Send size={18} /> Send Request
          </button>
        </div>
      )}

      {/* Sent Requests List */}
      {activeTab === "create" && (
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Your Requests</h2>

          {sentRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No requests sent yet.
            </p>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{request.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{request.message}</p>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {getVisibilityBadge(request.visibleTo)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{request.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="text-red-500 hover:text-red-700 mt-3 sm:mt-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Received Requests Section */}
      {activeTab === "received" && (
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Received Requests</h2>

          {receivedRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No requests received yet.
            </p>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{request.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{request.message}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        From: {request.sender}
                      </span>
                      <span>{request.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
