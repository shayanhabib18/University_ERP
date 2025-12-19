// src/pages/admin/HandleRequests.jsx
import { useState } from "react";

export default function HandleRequests() {
  const [activeTab, setActiveTab] = useState("general");

  const [requests, setRequests] = useState([
    {
      id: 1,
      sender: "Student",
      message: "Need roll number slip",
      status: "Pending",
    },
    {
      id: 2,
      sender: "Faculty",
      message: "Approve new course outline",
      status: "Pending",
    },
  ]);

  const [studentRequests, setStudentRequests] = useState([
    {
      id: 101,
      name: "Ali Ahmed",
      email: "ali@gmail.com",
      degree: "BSCS",
      city: "Lahore",
      status: "Pending",
    },
    {
      id: 102,
      name: "Sara Khan",
      email: "sara@gmail.com",
      degree: "BSSE",
      city: "Islamabad",
      status: "Pending",
    },
  ]);

  // General Requests Resolve
  const handleResolve = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "Resolved" } : req
      )
    );
  };

  // Student Approve / Decline
  const updateStudentStatus = (id, newStatus) => {
    setStudentRequests((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, status: newStatus } : student
      )
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">
        Requests Management
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "general"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          General Requests
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "students"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Student Signup Requests
        </button>
      </div>

      {/* General Requests Tab */}
      {activeTab === "general" && (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="border p-4 rounded-lg shadow-sm">
              <p className="font-semibold">From: {req.sender}</p>
              <p className="text-gray-600 mt-1">{req.message}</p>
              <p className="text-sm mt-2">
                Status:{" "}
                <span
                  className={`font-medium ${
                    req.status === "Resolved"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {req.status}
                </span>
              </p>

              {req.status !== "Resolved" && (
                <button
                  onClick={() => handleResolve(req.id)}
                  className="mt-3 bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Student Signup Requests Tab */}
      {activeTab === "students" && (
        <div className="space-y-4">
          {studentRequests.map((student) => (
            <div
              key={student.id}
              className="border p-4 rounded-lg shadow-sm"
            >
              <p className="font-semibold text-lg">{student.name}</p>
              <p className="text-sm text-gray-600">
                {student.email} • {student.city}
              </p>
              <p className="text-sm mt-1">
                Degree:{" "}
                <span className="font-medium">{student.degree}</span>
              </p>
              <p className="text-sm mt-2">
                Status:{" "}
                <span
                  className={`font-medium ${
                    student.status === "Approved"
                      ? "text-green-600"
                      : student.status === "Declined"
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  {student.status}
                </span>
              </p>

              {student.status === "Pending" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      updateStudentStatus(student.id, "Approved")
                    }
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStudentStatus(student.id, "Declined")
                    }
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
