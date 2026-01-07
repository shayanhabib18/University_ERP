// src/pages/admin/HandleRequests.jsx
import { useState, useEffect } from "react";

export default function HandleRequests() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [requests, setRequests] = useState([]);

  const [studentRequests, setStudentRequests] = useState([]);
  const [viewingStudent, setViewingStudent] = useState(null);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "students") {
      fetchSignupRequests();
    } else if (activeTab === "general") {
      fetchGeneralRequests();
    }
  }, [activeTab]);

  const fetchGeneralRequests = async () => {
    try {
      setLoading(true);
      setError("");
      // For now showing empty state - you can create a backend endpoint for general requests later
      // const response = await fetch("http://localhost:5000/requests/general");
      // const data = await response.json();
      setRequests([]);
    } catch (err) {
      console.error("Failed to fetch general requests:", err);
      setError("Failed to load general requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSignupRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/students/signup-requests");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched signup requests:", data);
      setStudentRequests(data || []);
    } catch (err) {
      console.error("Failed to fetch signup requests:", err);
      setError("Failed to load signup requests. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // General Requests Resolve
  const handleResolve = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "Resolved" } : req
      )
    );
  };

  // Student Approve / Decline
  const updateStudentStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/students/signup-requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state
      setStudentRequests((prev) =>
        prev.map((student) =>
          student.id === id ? { ...student, status: newStatus } : student
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update request status");
    }
  };

  // Delete Student Request
  const deleteStudentRequest = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/students/signup-requests/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete request");
      }

      // Update local state
      setStudentRequests((prev) =>
        prev.filter((student) => student.id !== id)
      );
    } catch (err) {
      console.error("Error deleting request:", err);
      setError("Failed to delete request");
    }
  };

  // View Student Details
  const handleViewStudent = (student) => {
    setViewingStudent(student);
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
        <>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-lg mb-2">No General Requests</p>
              <p className="text-gray-500 text-sm">
                General requests from students and faculty will appear here
              </p>
            </div>
          ) : (
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
        </>
      )}

      {/* Student Signup Requests Tab */}
      {activeTab === "students" && (
        <>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading signup requests...</p>
            </div>
          ) : studentRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No signup requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentRequests.map((student) => (
                <div
                  key={student.id}
                  className="border p-4 rounded-lg shadow-sm"
                >
                  <p className="font-semibold text-lg">{student.student_name}</p>
                  <p className="text-sm text-gray-600">
                    {student.email} • {student.city}
                  </p>
                  <p className="text-sm mt-1">
                    Department:{" "}
                    <span className="font-medium">
                      {student.departments?.name || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm">
                    Marks:{" "}
                    <span className="font-medium">
                      {student.obtained_marks}/{student.total_marks} 
                      ({((student.obtained_marks / student.total_marks) * 100).toFixed(2)}%)
                    </span>
                  </p>
                  <p className="text-sm mt-2">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        student.status === "approved"
                          ? "text-green-600"
                          : student.status === "declined"
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </p>

                  {student.status === "pending" && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          updateStudentStatus(student.id, "Approved")
                        }
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => deleteStudentRequest(student.id)}
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {student.status !== "pending" && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() => deleteStudentRequest(student.id)}
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* View Student Modal */}
          {viewingStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Student Signup Request
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Complete application details
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingStudent(null)}
                    className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2">
                        Personal Information
                      </h3>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Student Name</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {viewingStudent.student_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase">Father Name</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {viewingStudent.father_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase">CNIC</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {viewingStudent.cnic}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase">City</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {viewingStudent.city}
                        </p>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2">
                        Contact Information
                      </h3>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Email Address</p>
                        <p className="font-semibold text-gray-800 mt-1 break-all">
                          {viewingStudent.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase">Mobile Number</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {viewingStudent.mobile}
                        </p>
                      </div>
                    </div>

                    {/* Academic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2">
                        Academic Information
                      </h3>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Department</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {viewingStudent.departments?.name || "N/A"}
                          {viewingStudent.departments?.code && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({viewingStudent.departments.code})
                            </span>
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase">Last Qualification</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {viewingStudent.qualification}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase">Marks Obtained</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {viewingStudent.obtained_marks} / {viewingStudent.total_marks}
                        </p>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                ((viewingStudent.obtained_marks / viewingStudent.total_marks) * 100) >= 55 
                                  ? 'bg-green-600' 
                                  : 'bg-red-600'
                              }`}
                              style={{ 
                                width: `${((viewingStudent.obtained_marks / viewingStudent.total_marks) * 100).toFixed(2)}%` 
                              }}
                            ></div>
                          </div>
                          <p className={`text-sm font-medium mt-1 ${
                            ((viewingStudent.obtained_marks / viewingStudent.total_marks) * 100) >= 55 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {((viewingStudent.obtained_marks / viewingStudent.total_marks) * 100).toFixed(2)}%
                            {((viewingStudent.obtained_marks / viewingStudent.total_marks) * 100) >= 55 
                              ? ' - Eligible' 
                              : ' - Not Eligible (Min 55% required)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Joining Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2">
                        Joining Details
                      </h3>
                      
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Joining Session</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {viewingStudent.joining_session}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase">Joining Date</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {new Date(viewingStudent.joining_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase">Application Status</p>
                        <p className="mt-1">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              viewingStudent.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : viewingStudent.status === "declined"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {viewingStudent.status.charAt(0).toUpperCase() + viewingStudent.status.slice(1)}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase">Submitted On</p>
                        <p className="font-semibold text-gray-800 mt-1">
                          {new Date(viewingStudent.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-indigo-700 mb-4">
                      Uploaded Document
                    </h3>
                    
                    {viewingStudent.marksheet_url ? (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {viewingStudent.marksheet_url}
                            </p>
                            <p className="text-sm text-gray-500">Marksheet Document</p>
                          </div>
                        </div>
                        <button 
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                          onClick={() => alert('Document viewing functionality - integrate with your file storage')}
                        >
                          View Document
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">No document uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  {viewingStudent.status === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          updateStudentStatus(viewingStudent.id, "Approved");
                          setViewingStudent(null);
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this request?')) {
                            deleteStudentRequest(viewingStudent.id);
                            setViewingStudent(null);
                          }
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        Delete Request
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setViewingStudent(null)}
                    className={`${viewingStudent.status === "pending" ? 'flex-1' : 'w-full'} bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition font-medium`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
