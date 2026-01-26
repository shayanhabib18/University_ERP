import { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  Eye,
  X,
  CheckCircle,
  Trash2,
  Loader,
} from "lucide-react";

export default function FacultyManagement() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewFaculty, setViewFaculty] = useState(null);
  const [assignFaculty, setAssignFaculty] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseWorkload, setCourseWorkload] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);

  const availableCourses = [
    "Principles of Management",
    "Business Communication",
    "Marketing 101",
    "Financial Accounting",
    "Business Ethics",
    "Corporate Finance",
    "Organizational Behavior",
  ];

  // Fetch faculty on component mount
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const token = localStorage.getItem("facultyToken");
        console.log("🔍 Token present:", !!token);
        
        if (!token) {
          console.error("❌ No faculty token found in localStorage");
          setError("No authentication token found. Please login again.");
          setLoading(false);
          return;
        }

        // Get faculty profile to get department_id
        console.log("📡 Fetching faculty profile...");
        const profileRes = await fetch(
          "http://localhost:5000/faculties/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("📊 Profile response status:", profileRes.status);
        
        if (!profileRes.ok) {
          const errText = await profileRes.text();
          console.error("❌ Profile fetch failed:", profileRes.statusText, errText);
          setError(`Failed to fetch profile: ${profileRes.statusText}`);
          setLoading(false);
          return;
        }

        const profile = await profileRes.json();
        console.log("✅ Profile fetched:", profile.name, profile.department_id);
        const departmentId = profile.department_id;

        // Fetch department name for display
        let departmentName = "";
        try {
          const deptRes = await fetch(`http://localhost:5000/departments/${departmentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (deptRes.ok) {
            const dept = await deptRes.json();
            departmentName = dept?.name || dept?.department_name || dept?.title || "";
          }
        } catch (deptErr) {
          console.warn("⚠️ Department fetch failed, continuing without name", deptErr);
        }

        // Get all faculty in department
        console.log("📡 Fetching faculty for department:", departmentId);
        const facultyRes = await fetch(
          `http://localhost:5000/faculties/department/${departmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("📊 Faculty response status:", facultyRes.status);
        
        if (!facultyRes.ok) {
          const errText = await facultyRes.text();
          console.error("❌ Faculty fetch failed:", facultyRes.statusText, errText);
          setError(`Failed to fetch faculty: ${facultyRes.statusText}`);
          setLoading(false);
          return;
        }

        let faculties = await facultyRes.json();
        console.log("✅ Faculty list fetched:", faculties.length, "faculty members");

        if (!Array.isArray(faculties)) {
          console.error("❌ Faculty list is not an array:", typeof faculties);
          setError("Invalid faculty data format");
          setLoading(false);
          return;
        }

        // Fetch assigned courses for each faculty
        const facultyWithCourses = await Promise.all(
          faculties.map(async (faculty) => {
            try {
              const coursesRes = await fetch(
                `http://localhost:5000/faculty-courses/faculty/${faculty.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const courses = coursesRes.ok ? await coursesRes.json() : [];
              console.log(`  📚 ${faculty.name}: ${courses.length} courses`);
              const assigned = Array.isArray(courses)
                ? courses
                    .map((c) => ({
                      id: c.course?.id || c.id,
                      name: c.course?.name || c.course_name || c.name || "",
                      creditHours: c.course?.credit_hours || c.credit_hours || 0,
                    }))
                    .filter((c) => c.name)
                : [];
              const workload = Array.isArray(courses)
                ? courses.reduce(
                    (sum, c) => sum + (c.course?.credit_hours || c.credit_hours || 0),
                    0
                  )
                : 0;
              return {
                ...faculty,
                department:
                  departmentName || faculty.department_name || faculty.department || "N/A",
                joinDate:
                  faculty.joining_date || faculty.joinDate || faculty.joiningDate || "N/A",
                designation: faculty.designation || "N/A",
                courses: Array.isArray(courses) ? courses.length : 0,
                workload,
                assignedCourses: assigned,
              };
            } catch (error) {
              console.error("Error fetching courses for", faculty.name, ":", error);
              return {
                ...faculty,
                department:
                  departmentName || faculty.department_name || faculty.department || "N/A",
                joinDate:
                  faculty.joining_date || faculty.joinDate || faculty.joiningDate || "N/A",
                designation: faculty.designation || "N/A",
                courses: 0,
                workload: 0,
                assignedCourses: [],
              };
            }
          })
        );

        console.log("✅ All faculty with courses loaded:", facultyWithCourses.length);
        setFacultyList(facultyWithCourses);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching faculty:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Assign course
  const handleAssignCourse = () => {
    if (!selectedCourse.trim() || !courseWorkload.trim()) return;

    setFacultyList((prev) =>
      prev.map((f) =>
        f.id === assignFaculty.id
          ? {
              ...f,
              assignedCourses: [...f.assignedCourses, selectedCourse],
              courses: f.courses + 1,
              workload: f.workload + Number(courseWorkload),
            }
          : f
      )
    );

    setAssignFaculty((prev) => ({
      ...prev,
      assignedCourses: [...prev.assignedCourses, selectedCourse],
      courses: prev.courses + 1,
      workload: prev.workload + Number(courseWorkload),
    }));

    setSelectedCourse("");
    setCourseWorkload("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // ✅ Unassign course
  const handleUnassignCourse = async (course) => {
    try {
      const token = localStorage.getItem("facultyToken");
      if (!token) throw new Error("Missing auth token");

      // Call backend to unassign
      const res = await fetch(
        `http://localhost:5000/faculty-courses/${assignFaculty.id}/${course.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to unassign course");
      }

      // Update local state
      setFacultyList((prev) =>
        prev.map((f) =>
          f.id === assignFaculty.id
            ? {
                ...f,
                assignedCourses: (f.assignedCourses || []).filter(
                  (c) => (c.id ?? c) !== course.id
                ),
                courses: Math.max(f.courses - 1, 0),
                workload: Math.max(f.workload - (course.creditHours || 0), 0),
              }
            : f
        )
      );

      setAssignFaculty((prev) => ({
        ...prev,
        assignedCourses: (prev.assignedCourses || []).filter(
          (c) => (c.id ?? c) !== course.id
        ),
        courses: Math.max(prev.courses - 1, 0),
        workload: Math.max(prev.workload - (course.creditHours || 0), 0),
      }));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Unassign failed:", err);
      alert("Failed to unassign course: " + (err.message || "Unknown error"));
    }
  };

  const handleRemoveFaculty = (id) => {
    setFacultyList((prev) => prev.filter((f) => f.id !== id));
    setConfirmRemove(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate__animated animate__fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Faculty Management
          </h1>
          <p className="text-gray-500">
            Manage and monitor faculty members in your department
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-2">❌ Error Loading Faculty</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="mb-6 flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-2 px-4 max-w-md">
            <Search className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search faculty by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
            />
          </div>

          {/* Success Notification */}
          {showSuccess && (
            <div className="fixed top-5 right-5 bg-green-500 text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg animate__animated animate__fadeInDown">
              <CheckCircle size={18} /> Action completed successfully!
            </div>
          )}

          {/* Faculty Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3 text-center">Courses</th>
                  <th className="px-6 py-3 text-center">Workload (CrHr)</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
            {filteredFaculty.length > 0 ? (
              filteredFaculty.map((faculty, index) => (
                <tr
                  key={faculty.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {faculty.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{faculty.email}</td>
                  <td className="px-6 py-4 text-center text-gray-800 font-semibold">
                    {faculty.courses}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800 font-semibold">
                    {faculty.workload}
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setViewFaculty(faculty)}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs shadow-sm transition-all"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => setAssignFaculty(faculty)}
                      className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs shadow-sm transition-all"
                    >
                      <BookOpen size={14} /> Manage
                    </button>
                    <button
                      onClick={() => setConfirmRemove(faculty)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs shadow-sm transition-all"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="space-y-4">
                    <p className="text-gray-500 text-lg">No faculty found.</p>
                    {/* Debug Info */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto text-left text-sm">
                      <p className="font-semibold text-red-800 mb-2">🔍 Debug Information:</p>
                      <ul className="space-y-1 text-red-700">
                        <li>• Total faculty loaded: <strong>{facultyList.length}</strong></li>
                        <li>• Search term: <strong>{searchTerm || "none"}</strong></li>
                        <li>• Filtered results: <strong>{filteredFaculty.length}</strong></li>
                        <li>• Token in localStorage: <strong>{localStorage.getItem("facultyToken") ? "Yes" : "No"}</strong></li>
                        <li>• Email in localStorage: <strong>{localStorage.getItem("facultyEmail") || "None"}</strong></li>
                      </ul>
                      <p className="mt-3 text-xs text-red-600">
                        📌 <strong>Check browser console (F12) for detailed API logs</strong>
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </>
      )}

      {/* Manage Courses Modal */}
      {assignFaculty && (
        <Modal
          title={`Manage Courses for ${assignFaculty.name}`}
          onClose={() => setAssignFaculty(null)}
        >
          <div className="space-y-5 text-gray-800">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border">
              <p>
                <strong>Department:</strong> {assignFaculty.department}
              </p>
              <p>
                <strong>Current Workload:</strong> {assignFaculty.workload} CrHr
              </p>
              <p>
                <strong>Total Courses:</strong> {assignFaculty.courses}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a course --</option>
                  {availableCourses.map((course, i) => (
                    <option key={i} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Workload (CrHr)
                </label>
                <input
                  type="number"
                  value={courseWorkload}
                  onChange={(e) => setCourseWorkload(e.target.value)}
                  placeholder="e.g., 3"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAssignFaculty(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCourse}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
              >
                Assign
              </button>
            </div>

            <div className="border-t pt-3 mt-4">
              <h3 className="font-bold text-gray-900 mb-2">
                Assigned Courses:
              </h3>
              {assignFaculty.assignedCourses.length > 0 ? (
                <ul className="space-y-2">
                  {assignFaculty.assignedCourses.map((course, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-2"
                    >
                      <span>{typeof course === "string" ? course : course.name}</span>
                      <button
                        onClick={() => handleUnassignCourse(course)}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Unassign
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No courses assigned.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Remove Modal */}
      {confirmRemove && (
        <Modal title="Confirm Removal" onClose={() => setConfirmRemove(null)}>
          <p className="text-gray-700 mb-4">
            Are you sure you want to remove{" "}
            <span className="font-semibold">{confirmRemove.name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmRemove(null)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRemoveFaculty(confirmRemove.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}

      {/* View Faculty Modal */}
      {viewFaculty && (
        <Modal title="Faculty Details" onClose={() => setViewFaculty(null)}>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Name:</strong> {viewFaculty.name}
            </p>
            <p>
              <strong>Email:</strong> {viewFaculty.email}
            </p>
            <p>
              <strong>Department:</strong> {viewFaculty.department}
            </p>
            <p>
              <strong>Designation:</strong> {viewFaculty.designation}
            </p>
            <p>
              <strong>Join Date:</strong> {viewFaculty.joinDate}
            </p>
            <p>
              <strong>Workload:</strong> {viewFaculty.workload} CrHr
            </p>
            <div className="border-t pt-2">
              <strong>Assigned Courses:</strong>
              <ul className="list-disc list-inside text-sm mt-1">
                {viewFaculty.assignedCourses.map((c, i) => (
                  <li key={i}>{typeof c === "string" ? c : c.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ✅ Reusable Modal Component
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 animate__animated animate__fadeIn">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg animate__animated animate__zoomIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold mb-4 text-gray-800">{title}</h2>
        {children}
      </div>
    </div>
  );
}
