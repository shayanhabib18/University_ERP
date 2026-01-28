import React, { useEffect, useState } from "react";
import { courseAddDropAPI } from "../../services/courseAddDropAPI";
import { departmentAPI, semesterAPI } from "../../services/api";
import { ChevronDown, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";

const CourseAddDrop = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState(null);

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await departmentAPI.getAll();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    const dept = departments.find((d) => d.id === deptId);
    setSelectedDept(dept || null);
    setSelectedStudent(null);
    setStudents([]);
    setStudentEnrollments([]);
    setAvailableCourses([]);

    if (deptId) {
      await loadStudentsByDepartment(deptId);
      await loadAvailableCourses(deptId);
      await loadSemesters(deptId);
    }
  };

  const loadStudentsByDepartment = async (deptId) => {
    try {
      setLoading(true);
      setError("");
      const data = await courseAddDropAPI.getStudentsByDepartment(deptId);
      setStudents(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err?.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCourses = async (deptId) => {
    try {
      const data = await courseAddDropAPI.getAvailableCourses(deptId);
      setAvailableCourses(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  const loadSemesters = async (deptId) => {
    try {
      const data = await semesterAPI.getByDepartment(deptId);
      setSemesters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load semesters:", err);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setExpandedStudent(expandedStudent === student.id ? null : student.id);

    if (expandedStudent !== student.id) {
      try {
        const data = await courseAddDropAPI.getStudentEnrollments(student.id);
        setStudentEnrollments(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err?.message || "Failed to load enrollments");
        setStudentEnrollments([]);
      }
    }
  };

  const handleAddCourse = async () => {
    if (!selectedStudent || !selectedCourseToAdd) {
      setError("Please select a student and course");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await courseAddDropAPI.addCourse(selectedStudent.id, selectedCourseToAdd.id);

      setSuccess(`Course added successfully!`);
      setShowAddCourseModal(false);
      setSelectedCourseToAdd(null);

      // Reload enrollments
      const data = await courseAddDropAPI.getStudentEnrollments(selectedStudent.id);
      setStudentEnrollments(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err?.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to drop this course?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await courseAddDropAPI.dropCourse(enrollmentId);

      setSuccess("Course dropped successfully!");

      // Reload enrollments
      if (selectedStudent) {
        const data = await courseAddDropAPI.getStudentEnrollments(
          selectedStudent.id
        );
        setStudentEnrollments(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      setError(err?.message || "Failed to drop course");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSemester = () => {
    // Get current semester (typically semester 1-8 for 4-year program)
    // You can adjust this logic based on your academic calendar
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    // Assuming fall semester is Aug-Dec (months 7-11) and spring is Jan-May (months 0-4)
    return currentMonth >= 7 ? 1 : 2; // Simplified - adjust as needed
  };

  const getCurrentAcademicYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    // If before August, use previous year
    return currentMonth < 7 ? currentYear - 1 : currentYear;
  };

  const getCurrentEnrollments = () => {
    return studentEnrollments.filter((e) => {
      // Show all courses that are not dropped and not from future semesters
      // This includes current semester courses AND courses awaiting result
      return e.status !== 'dropped';
    });
  };

  const getEnrolledCourseIds = () => {
    return getCurrentEnrollments()
      .map((e) => e.course_id);
  };

  const getAvailableCoursesToAdd = () => {
    const enrolledIds = getEnrolledCourseIds();
    return availableCourses.filter((c) => !enrolledIds.includes(c.id));
  };

  const getTotalCredits = () => {
    return getCurrentEnrollments()
      .reduce((total, e) => total + (e.courses?.credit_hours || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Course Add/Drop Management
          </h1>
          <p className="text-gray-600">
            Manage student course registrations and enrollments
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Department & Students */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Select Department
              </h2>

              {/* Department Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedDept?.id || ""}
                  onChange={handleDepartmentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name || dept.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Students List */}
              {selectedDept && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Students ({students.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {loading ? (
                      <p className="text-gray-500">Loading students...</p>
                    ) : students.length > 0 ? (
                      students.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleStudentClick(student)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedStudent?.id === student.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                          }`}
                        >
                          <div className="font-medium">{student.full_name}</div>
                          <div className="text-sm opacity-75">
                            {student.roll_number}
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500">No students found</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content - Student Details & Courses */}
          <div className="lg:col-span-3">
            {selectedStudent ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedStudent.full_name}
                  </h2>
                  <p className="text-gray-600">
                    Roll No: {selectedStudent.roll_number}
                  </p>
                  <p className="text-gray-600">
                    Email: {selectedStudent.personal_email || selectedStudent.email}
                  </p>
                  <p className="text-gray-600">
                    Joining Session: {selectedStudent.joining_session}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Total Credits (Current Semester)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {getTotalCredits()}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Current Courses</p>
                    <p className="text-2xl font-bold text-green-600">
                      {getCurrentEnrollments().length}
                    </p>
                  </div>
                </div>

                {/* Add Course Button */}
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  disabled={loading || getAvailableCoursesToAdd().length === 0}
                  className="mb-6 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  Add Course
                </button>

                {/* Current Enrollments */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Active Courses ({getCurrentEnrollments().length})
                </h3>
                {getCurrentEnrollments().length > 0 ? (
                  <div className="space-y-3">
                    {getCurrentEnrollments()
                      .map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {enrollment.courses?.code} -{" "}
                              {enrollment.courses?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Credit Hours: {enrollment.courses?.credit_hours}
                            </p>
                            <p className="text-xs text-gray-500">
                              Semester {enrollment.semester} | Year: {enrollment.academic_year}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDropCourse(enrollment.id)}
                            disabled={loading}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Drop this course"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No active courses</p>
                )}

                {/* Dropped Courses Section Removed */}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <ChevronDown size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">
                  Select a department and student to manage their courses
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Course Modal */}
        {showAddCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Add Course
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourseToAdd?.id || ""}
                  onChange={(e) => {
                    const course = getAvailableCoursesToAdd().find(
                      (c) => c.id === e.target.value
                    );
                    setSelectedCourseToAdd(course || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a course...</option>
                  {getAvailableCoursesToAdd().map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name} ({course.credit_hours} cr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddCourseModal(false);
                    setSelectedCourseToAdd(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCourse}
                  disabled={loading || !selectedCourseToAdd}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {loading ? "Adding..." : "Add Course"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAddDrop;
