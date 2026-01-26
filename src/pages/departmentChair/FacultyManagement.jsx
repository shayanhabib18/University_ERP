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
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [departmentCourses, setDepartmentCourses] = useState([]);
  const [departmentId, setDepartmentId] = useState(null);
  const [courseSelectionOpen, setCourseSelectionOpen] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  // Fetch assigned courses with normalized shape and workload total
  const fetchAssignedCourses = async (facultyId, tokenOverride) => {
    const token = tokenOverride || localStorage.getItem("facultyToken");
    if (!token) throw new Error("Missing auth token");

    const res = await fetch(
      `http://localhost:5000/faculty-courses/faculty/${facultyId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to fetch assigned courses");
    }

    const data = await res.json();
    const list = Array.isArray(data)
      ? data
          .map((c) => {
            const courseObj = c.course || c;
            return {
              id: courseObj?.id || c.id,
              name: courseObj?.name || c.course_name || c.name || "",
              code: courseObj?.code || c.code || "",
              creditHours:
                courseObj?.credit_hours ||
                courseObj?.crhr ||
                c.credit_hours ||
                c.crhr ||
                0,
            };
          })
          .filter((c) => c.name)
      : [];

    const workload = list.reduce((sum, c) => sum + (c.creditHours || 0), 0);
    return { list, workload };
  };

  // Fetch faculty on component mount
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const token = localStorage.getItem("facultyToken");
        const email = localStorage.getItem("facultyEmail");
        console.log("🔍 Token present:", !!token, "Email:", email);
        
        if (!token || !email) {
          console.error("❌ No faculty token or email found in localStorage");
          setError("No authentication token found. Please login again.");
          setLoading(false);
          return;
        }

        // Get faculty profile by email to get department_id
        console.log("📡 Fetching faculty profile...");
        const profileRes = await fetch(
          `http://localhost:5000/faculties/profile/${encodeURIComponent(email)}`
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
        setDepartmentId(departmentId);

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
              const { list, workload } = await fetchAssignedCourses(
                faculty.id,
                token
              );
              console.log(`  📚 ${faculty.name}: ${list.length} courses`);
              return {
                ...faculty,
                department:
                  departmentName || faculty.department_name || faculty.department || "N/A",
                joinDate:
                  faculty.joining_date || faculty.joinDate || faculty.joiningDate || "N/A",
                designation: faculty.designation || "N/A",
                courses: list.length,
                workload,
                assignedCourses: list,
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

  // Fetch courses for the department
  const fetchDepartmentCourses = async () => {
    setCoursesLoading(true);
    try {
      const token = localStorage.getItem("facultyToken");
      console.log("🔍 fetchDepartmentCourses called");
      console.log("📋 departmentId:", departmentId);

      if (!token || !departmentId) {
        console.warn("⚠️ Missing token or departmentId");
        return [];
      }

      // Get semesters for this department
      const semestersRes = await fetch(
        `http://localhost:5000/semesters/department/${departmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!semestersRes.ok) {
        console.error("❌ Failed to fetch semesters:", semestersRes.status);
        setDepartmentCourses([]);
        return [];
      }

      const semesters = await semestersRes.json();
      const semesterIds = Array.isArray(semesters) ? semesters.map((s) => s.id) : [];

      const courseLists = await Promise.all(
        semesterIds.map(async (semId) => {
          const res = await fetch(
            `http://localhost:5000/courses/semester/${semId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) return [];
          return res.json();
        })
      );

      const flatCourses = courseLists
        .flat()
        .map((c) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          creditHours: c.credit_hours || c.crhr || 0,
          semesterId: c.semester_id,
        }))
        .filter((c) => c.id && c.name);

      // Ensure uniqueness by course id
      const uniqueById = Object.values(
        flatCourses.reduce((acc, c) => {
          acc[c.id] = c;
          return acc;
        }, {})
      );

      console.log("✅ Department courses loaded:", uniqueById.length);
      setDepartmentCourses(uniqueById);
      return uniqueById;
    } catch (error) {
      console.error("💥 Error fetching department courses:", error);
      setDepartmentCourses([]);
      return [];
    } finally {
      setCoursesLoading(false);
    }
  };

  // Open manage modal and fetch courses
  const handleManageClick = (faculty) => {
    setAssignFaculty(faculty);
    setCourseSelectionOpen(false);
    setSelectedCourseIds([]);
    fetchDepartmentCourses();
  };

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignedCourseIds = assignFaculty
    ? (assignFaculty.assignedCourses || []).map((c) => c.id ?? c)
    : [];

  const availableCoursesForFaculty = assignFaculty
    ? departmentCourses.filter((course) => !assignedCourseIds.includes(course.id))
    : [];

  const closeAssignModal = () => {
    setAssignFaculty(null);
    setCourseSelectionOpen(false);
    setSelectedCourseIds([]);
  };

  // ✅ Assign selected courses via API
  const handleAssignCourse = async () => {
    if (!assignFaculty) return;
    if (selectedCourseIds.length === 0) {
      alert("Select at least one course to assign.");
      return;
    }

    try {
      const token = localStorage.getItem("facultyToken");
      if (!token) throw new Error("Missing auth token");

      setAssignLoading(true);

      const res = await fetch(`http://localhost:5000/faculty-courses/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          faculty_id: assignFaculty.id,
          course_ids: selectedCourseIds,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to assign courses");
      }

      const { list, workload } = await fetchAssignedCourses(assignFaculty.id, token);

      setFacultyList((prev) =>
        prev.map((f) =>
          f.id === assignFaculty.id
            ? {
                ...f,
                assignedCourses: list,
                courses: list.length,
                workload,
              }
            : f
        )
      );

      setAssignFaculty((prev) =>
        prev
          ? {
              ...prev,
              assignedCourses: list,
              courses: list.length,
              workload,
            }
          : prev
      );

      setSelectedCourseIds([]);
      setCourseSelectionOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Assign failed:", err);
      alert("Failed to assign course: " + (err.message || "Unknown error"));
    } finally {
      setAssignLoading(false);
    }
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

      // Refresh assigned courses to keep workload accurate
      const { list, workload } = await fetchAssignedCourses(assignFaculty.id, token);

      setFacultyList((prev) =>
        prev.map((f) =>
          f.id === assignFaculty.id
            ? {
                ...f,
                assignedCourses: list,
                courses: list.length,
                workload,
              }
            : f
        )
      );

      setAssignFaculty((prev) =>
        prev
          ? {
              ...prev,
              assignedCourses: list,
              courses: list.length,
              workload,
            }
          : prev
      );

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
                      onClick={() => handleManageClick(faculty)}
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
          onClose={closeAssignModal}
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

            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-gray-900">Assign Course</h3>
                <button
                  onClick={async () => {
                    setCourseSelectionOpen((prev) => !prev);
                    setSelectedCourseIds([]);
                    await fetchDepartmentCourses();
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                >
                  {courseSelectionOpen ? "Close" : "Assign Course"}
                </button>
              </div>

              {courseSelectionOpen && (
                <div className="mt-3 space-y-3">
                  {coursesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader className="animate-spin" size={16} /> Loading department courses...
                    </div>
                  ) : availableCoursesForFaculty.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {availableCoursesForFaculty.map((course) => {
                        const checked = selectedCourseIds.includes(course.id);
                        return (
                          <label
                            key={course.id}
                            className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-md p-2 cursor-pointer hover:border-indigo-300"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">{course.name}</p>
                              <p className="text-xs text-gray-500">
                                {course.code || "—"} • {course.creditHours || 0} CrHr
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedCourseIds((prev) =>
                                  checked
                                    ? prev.filter((id) => id !== course.id)
                                    : [...prev, course.id]
                                );
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No additional courses available in this department to assign.
                    </p>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setCourseSelectionOpen(false);
                        setSelectedCourseIds([]);
                      }}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignCourse}
                      disabled={assignLoading || selectedCourseIds.length === 0 || coursesLoading}
                      className={`px-3 py-1.5 rounded-md text-sm text-white ${
                        assignLoading || selectedCourseIds.length === 0 || coursesLoading
                          ? "bg-indigo-300 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {assignLoading ? "Saving..." : "Save Assignment"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-3 mt-4">
              <h3 className="font-bold text-gray-900 mb-2">
                Assigned Courses:
              </h3>
              {(assignFaculty.assignedCourses || []).length > 0 ? (
                <ul className="space-y-2">
                  {(assignFaculty.assignedCourses || []).map((course, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-2"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {typeof course === "string" ? course : course.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(course.code || "—") + " • " + ((course.creditHours || 0) + " CrHr")}
                        </p>
                      </div>
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
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg animate__animated animate__zoomIn max-h-[85vh] overflow-y-auto">
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
