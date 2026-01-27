import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  BookOpen,
} from "lucide-react";
import assignmentAPI from "../../services/assignmentAPI";

export default function ViewSubmissions() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadAssignments();
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedAssignment) {
      loadSubmissions();
    }
  }, [selectedAssignment]);

  // When assignments list updates and none is selected, pick the first to show submissions
  useEffect(() => {
    if (!selectedAssignment && assignments.length > 0) {
      setSelectedAssignment(assignments[0].id);
    }
  }, [assignments, selectedAssignment]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const token = localStorage.getItem("facultyToken");
      if (!token) {
        console.warn("No faculty token found");
        return;
      }

      const profileResp = await fetch("http://localhost:5000/faculties/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileResp.ok) {
        console.error("Failed to load faculty profile");
        return;
      }
      const profile = await profileResp.json();
      const facultyId = profile.id;

      const coursesResp = await fetch(
        `http://localhost:5000/faculty-courses/faculty/${facultyId}`
      );
      if (!coursesResp.ok) {
        console.error("Failed to load faculty courses");
        return;
      }
      const data = await coursesResp.json();
      const mapped = (data || [])
        .map((c) => ({
          id: c?.course?.id,
          code: c?.course?.code,
          name: c?.course?.name,
        }))
        .filter((c) => c.id);
      setCourses(mapped);
    } catch (error) {
      console.error("Error loading courses", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      // Fetch all assignments for this course created by this faculty
      const token = localStorage.getItem("facultyToken");
      const response = await fetch(
        `http://localhost:5000/assignments?courseId=${selectedCourse}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-role": "faculty",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssignments(data || []);
        // Auto-select the first assignment so submissions are visible immediately
        if ((data || []).length > 0) {
          setSelectedAssignment((prev) => prev || data[0].id);
        }
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await assignmentAPI.getSubmissions(selectedAssignment);
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const selectedAssignmentDetails = assignments.find(
    (a) => a.id === selectedAssignment
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-blue-600" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Assignment Submissions
              </h1>
              <p className="text-gray-600 text-sm">
                View and manage student submissions
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="inline w-4 h-4 mr-2" />
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedAssignment("");
                  setSubmissions([]);
                }}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={loadingCourses}
              >
                <option value="">
                  {loadingCourses ? "Loading courses..." : "Select a course"}
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code ? `${course.code} - ` : ""}
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-2" />
                Select Assignment
              </label>
              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={!selectedCourse || loading || assignments.length === 0}
              >
                <option value="">
                  {!selectedCourse
                    ? "Select a course first"
                    : loading
                    ? "Loading assignments..."
                    : assignments.length === 0
                    ? "No assignments found"
                    : "Select an assignment"}
                </option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignment Details */}
          {selectedAssignmentDetails && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Deadline:{" "}
                    <span className="font-medium text-gray-800">
                      {formatDateTime(selectedAssignmentDetails.deadline)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <Users className="inline w-4 h-4 mr-1" />
                    Total Submissions:{" "}
                    <span className="font-medium text-gray-800">
                      {submissions.length}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submissions List */}
        {loading && selectedAssignment && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        )}

        {!loading && selectedAssignment && submissions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Submissions Yet
            </h3>
            <p className="text-gray-500">
              Students haven't submitted their assignments yet.
            </p>
          </div>
        )}

        {!loading && submissions.length > 0 && (
          <div className="grid gap-4">
            {submissions.map((submission, index) => (
              <div
                key={submission.id || index}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {submission.students?.full_name || "Student"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Roll Number: {submission.students?.roll_number || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="ml-13 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>
                          Submitted on: {formatDateTime(submission.submission_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            submission.status === "submitted"
                              ? "bg-green-100 text-green-700"
                              : submission.status === "graded"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {submission.status === "submitted"
                            ? "Submitted"
                            : submission.status === "graded"
                            ? "Graded"
                            : submission.status}
                        </span>
                        {submission.grade && (
                          <span className="text-sm font-medium text-gray-700">
                            Grade: {submission.grade}
                          </span>
                        )}
                      </div>

                      {submission.feedback && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Feedback:</span>{" "}
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:w-48">
                    {submission.submission_file_path && (
                      <button
                        onClick={() =>
                          handleDownload(submission.submission_file_path)
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download size={16} />
                        Download File
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!selectedAssignment && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Select an Assignment
            </h3>
            <p className="text-gray-500">
              Choose a course and assignment to view student submissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
