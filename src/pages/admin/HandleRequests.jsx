// src/pages/admin/HandleRequests.jsx
import { useState } from "react";

export default function HandleRequests() {
  const [requests, setRequests] = useState([
    { id: 1, sender: "Student", message: "Need roll number slip", status: "Pending" },
    { id: 2, sender: "Faculty", message: "Approve new course outline", status: "Pending" },
    { id: 3, sender: "Chairman", message: "Schedule meeting with VC", status: "Pending" },
  ]);

  const handleResponse = (id) => {
    const updated = requests.map((req) =>
      req.id === id ? { ...req, status: "Resolved" } : req
    );
    setRequests(updated);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">Incoming Requests</h1>
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="border p-4 rounded-lg shadow-sm">
            <p className="font-semibold text-slate-800">From: {req.sender}</p>
            <p className="text-slate-600 mt-1">{req.message}</p>
            <p className="text-sm mt-2">
              Status:{" "}
              <span
                className={`${
                  req.status === "Resolved" ? "text-green-600" : "text-orange-600"
                } font-medium`}
              >
                {req.status}
              </span>
            </p>
            {req.status !== "Resolved" && (
              <button
                onClick={() => handleResponse(req.id)}
                className="mt-2 inline-block bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
              >
                Mark as Resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
