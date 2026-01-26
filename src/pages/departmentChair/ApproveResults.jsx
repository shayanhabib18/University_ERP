import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader,
  Search,
  Award,
  Users,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function ApproveResults() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingCourse, setProcessingCourse] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);

  // Fetch pending results on page load
  useEffect(() => {
    fetchPendingResults();
  }, []);

  /**
   * Fetch all courses with pending results for approval
   */
  const fetchPendingResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("facultyToken");

      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/results/pending-for-hod`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending results");
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching pending results:", error);
      alert("Failed to load pending results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Approve all results for a specific course
   */
  const handleApproveAll = async (courseId) => {
    if (!window.confirm("Are you sure you want to approve all results for this course?")) {
      return;
    }

    try {
      setProcessingCourse(courseId);
      const token = localStorage.getItem("facultyToken");

      const response = await fetch(`${API_URL}/results/approve/${courseId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to approve results");
      }

      // Remove course from list after successful approval
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      alert("All results approved successfully!");
    } catch (error) {
      console.error("Error approving all results:", error);
      alert("Failed to approve results. Please try again.");
    } finally {
      setProcessingCourse(null);
    }
  };

  /**
   * Approve a single student result
   */
  const handleApproveResult = async (courseId, resultId) => {
    try {
      setProcessingResult(resultId);
      const token = localStorage.getItem("facultyToken");

      const response = await fetch(`${API_URL}/results/approve/${resultId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to approve result");
      }

      // Update UI: remove student from course results
      setCourses((prev) =>
        prev.map((course) => {
          if (course.id === courseId) {
            const updatedResults = course.results.filter(
              (result) => result.id !== resultId
            );
            // If no results left, remove the course
            return updatedResults.length > 0
              ? { ...course, results: updatedResults }
              : null;
          }
          return course;
        }).filter(Boolean)
      );

      alert("Result approved successfully!");
    } catch (error) {
      console.error("Error approving result:", error);
      alert("Failed to approve result. Please try again.");
    } finally {
      setProcessingResult(null);
    }
  };

  /**
   * Reject a single student result
   */
  const handleRejectResult = async (courseId, resultId) => {
    const reason = window.prompt("Please enter reason for rejection:");
    if (!reason) return;

    try {
      setProcessingResult(resultId);
      const token = localStorage.getItem("facultyToken");

      const response = await fetch(`${API_URL}/results/reject/${resultId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject result");
      }

      // Update UI: remove student from course results
      setCourses((prev) =>
        prev.map((course) => {
          if (course.id === courseId) {
            const updatedResults = course.results.filter(
              (result) => result.id !== resultId
            );
            // If no results left, remove the course
            return updatedResults.length > 0
              ? { ...course, results: updatedResults }
              : null;
          }
          return course;
        }).filter(Boolean)
      );

      alert("Result rejected successfully!");
    } catch (error) {
      console.error("Error rejecting result:", error);
      alert("Failed to reject result. Please try again.");
    } finally {
      setProcessingResult(null);
    }
  };

  /**
   * Toggle course expansion to show/hide student results
   */
  const toggleCourseExpansion = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  /**
   * Filter courses by search term
   */
  const filteredCourses = courses.filter((course) =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading pending results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="text-blue-600" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Approve Results</h1>
              <p className="text-gray-500 mt-1">
                Approve pending results for courses in your department
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by course name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="max-w-7xl mx-auto">
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Award className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Pending Results
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "No courses match your search criteria."
                : "All results have been processed. Great job!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Course Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-800">
                          {course.name}
                        </h2>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          {course.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Users size={16} />
                        <span>
                          {course.results?.length || 0} student(s) pending approval
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Approve All Button */}
                      <button
                        onClick={() => handleApproveAll(course.id)}
                        disabled={processingCourse === course.id}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {processingCourse === course.id ? (
                          <Loader className="animate-spin" size={18} />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                        Approve All
                      </button>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleCourseExpansion(course.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedCourse === course.id ? (
                          <ChevronUp size={24} />
                        ) : (
                          <ChevronDown size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Student Results Table */}
                {expandedCourse === course.id && (
                  <div className="border-t border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Roll Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Marks
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Grade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {course.results?.map((result) => (
                            <tr
                              key={result.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-700 font-medium">
                                      {result.student_name?.charAt(0) || "S"}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {result.student_name || "Unknown Student"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {result.roll_number || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-gray-900">
                                  {result.total_marks || 0}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">
                                  / 100
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                                    ["A", "A-", "B+"].includes(result.grade)
                                      ? "bg-green-100 text-green-700"
                                      : ["B", "B-", "C+"].includes(result.grade)
                                      ? "bg-blue-100 text-blue-700"
                                      : ["C", "C-", "D"].includes(result.grade)
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {result.grade || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {/* Approve Button */}
                                  <button
                                    onClick={() =>
                                      handleApproveResult(course.id, result.id)
                                    }
                                    disabled={processingResult === result.id}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  >
                                    {processingResult === result.id ? (
                                      <Loader className="animate-spin" size={16} />
                                    ) : (
                                      <CheckCircle size={16} />
                                    )}
                                    Approve
                                  </button>

                                  {/* Reject Button */}
                                  <button
                                    onClick={() =>
                                      handleRejectResult(course.id, result.id)
                                    }
                                    disabled={processingResult === result.id}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  >
                                    <XCircle size={16} />
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
