import React, { useEffect, useMemo, useState } from "react";
import { facultyAPI, departmentAPI, semesterAPI, courseAPI } from "../../services/api";

const roleOptions = [
  { value: "ALL", label: "Role: All" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "DEPT_CHAIR", label: "Department Chair" },
  { value: "COORDINATOR", label: "Coordinator" },
  { value: "FACULTY", label: "Faculty" },
  { value: "HOD", label: "HOD" },
];

const FacultyRoleManagement = () => {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [manualHODs, setManualHODs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [assigning, setAssigning] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  // Executive Assignment Modal States
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);
  const [selectedFacultyForExecutive, setSelectedFacultyForExecutive] = useState(null);
  const [executiveAssignmentMode, setExecutiveAssignmentMode] = useState("manual");
  const [manualExecutiveData, setManualExecutiveData] = useState({
    executiveFullName: "",
    executiveEmail: "",
    executiveCnic: "",
    executivePhone: "",
    executiveAddress: "",
    effectiveFrom: "",
  });
  const [executiveLoading, setExecutiveLoading] = useState(false);
  const [allFacultiesForSelection, setAllFacultiesForSelection] = useState([]);
  const [currentExecutive, setCurrentExecutive] = useState(null);

  // Assign Courses Modal States
  const [showAssignCoursesModal, setShowAssignCoursesModal] = useState(false);
  const [selectedFacultyForCourses, setSelectedFacultyForCourses] = useState(null);
  const [deptCourses, setDeptCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [assignCoursesLoading, setAssignCoursesLoading] = useState(false);

  // Manage Courses Modal States (View and Unassign)
  const [showManageCoursesModal, setShowManageCoursesModal] = useState(false);
  const [selectedFacultyForManage, setSelectedFacultyForManage] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [manageCoursesLoading, setManageCoursesLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [facultyRes, deptRes, executiveRes] = await Promise.all([
          facultyAPI.getAll(),
          departmentAPI.getAll(),
          facultyAPI.getCurrentExecutive(),
        ]);
        setFaculties(facultyRes || []);
        setDepartments(deptRes || []);
        setCurrentExecutive(executiveRes || null);

        // Extract manually assigned HODs from departments with assignment_mode='manual'
        if (deptRes && Array.isArray(deptRes)) {
          const manually = deptRes
            .filter(dept => dept.assignment_mode === 'manual' && dept.hod_full_name && dept.hod_email)
            .map(dept => ({
              id: `hod-${dept.id}`, // Unique ID for HOD entries
              name: dept.hod_full_name,
              email: dept.hod_email,
              department_id: dept.id,
              role: "HOD", // Initially just HOD, will be updated to "HOD & Faculty" when courses assigned
              is_hod: true,
              isManualHOD: true,
              has_courses: dept.has_courses || false, // Track if courses are assigned
            }));
          setManualHODs(manually);
        }
      } catch (err) {
        setError("Failed to load faculty data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const departmentById = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [departments]);

  const filteredFaculties = useMemo(() => {
    // Combine faculties and manual HODs
    const allEntries = [...faculties, ...manualHODs];
    
    return allEntries
      .filter((f) => {
        const matchesSearch = `${f.name || ""} ${f.email || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesRole =
          roleFilter === "ALL" || (f.role || "").toUpperCase() === roleFilter;
        const matchesDept =
          deptFilter === "ALL" || `${f.department_id}` === `${deptFilter}`;
        return matchesSearch && matchesRole && matchesDept;
      })
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [faculties, manualHODs, search, roleFilter, deptFilter]);

  const handleAssignExecutive = async (faculty) => {
    setSelectedFacultyForExecutive(faculty);
    setAllFacultiesForSelection(faculties);
    setExecutiveAssignmentMode("manual");
    setManualExecutiveData({
      executiveFullName: "",
      executiveEmail: "",
      executiveCnic: "",
      executivePhone: "",
      executiveAddress: "",
      effectiveFrom: "",
    });
    setShowExecutiveModal(true);
  };

  const handleConfirmExecutiveAssignment = async () => {
    if (!manualExecutiveData.executiveFullName.trim() || !manualExecutiveData.executiveEmail.trim()) {
      setError("Please enter Executive Full Name and Email");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualExecutiveData.executiveEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setExecutiveLoading(true);
      setError("");
      const payload = {
        mode: "manual",
        effectiveFrom: manualExecutiveData.effectiveFrom || null,
        executiveFullName: manualExecutiveData.executiveFullName.trim(),
        executiveEmail: manualExecutiveData.executiveEmail.trim(),
        executiveCnic: manualExecutiveData.executiveCnic?.trim() || null,
        executivePhone: manualExecutiveData.executivePhone?.trim() || null,
        executiveAddress: manualExecutiveData.executiveAddress?.trim() || null,
      };

      await facultyAPI.assignExecutive(payload);
      setStatusMessage("Executive assigned successfully!");
      
      // Reload faculties and current executive
      const [updatedFaculties, newExecutive] = await Promise.all([
        facultyAPI.getAll(),
        facultyAPI.getCurrentExecutive(),
      ]);
      setFaculties(updatedFaculties || []);
      setCurrentExecutive(newExecutive || null);
      
      // Close modal
      setShowExecutiveModal(false);
      setSelectedFacultyForExecutive(null);
      setManualExecutiveData({
        executiveFullName: "",
        executiveEmail: "",
        executiveCnic: "",
        executivePhone: "",
        executiveAddress: "",
        effectiveFrom: "",
      });
    } catch (err) {
      setError(err.message || "Failed to assign executive");
      console.error(err);
    } finally {
      setExecutiveLoading(false);
    }
  };

  const handleAssignCourses = async (faculty) => {
    try {
      setSelectedFacultyForCourses(faculty);
      setShowAssignCoursesModal(true);
      setDeptCourses([]);
      setSelectedCourseIds([]);
      setAssignCoursesLoading(true);
      
      // Get unassigned courses for this faculty from the backend
      const unassignedCourses = await facultyAPI.getUnassignedCourses(faculty.id);
      setDeptCourses(unassignedCourses || []);
      setAssignCoursesLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load available courses");
      setAssignCoursesLoading(false);
    }
  };

  const isRoleProhibitsCourses = (f) => {
    const role = (f.role || "").toUpperCase();
    return role === "EXECUTIVE" || role === "COORDINATOR";
  };

  const getDisplayRole = (f) => {
    // For manually assigned HODs
    if (f.isManualHOD) {
      if (f.has_courses) {
        return "HOD & Faculty"; // They now teach courses
      }
      return "HOD"; // Just HOD without faculty role
    }
    
    // For faculty assigned as HOD
    if (f.is_hod === true) {
      return "Faculty and HOD";
    }
    
    return f.role || "Unassigned";
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleConfirmAssignCourses = async () => {
    if (!selectedFacultyForCourses?.id) {
      setError("No faculty selected for course assignment");
      return;
    }
    if (selectedCourseIds.length === 0) {
      setError("Please select at least one course");
      return;
    }
    try {
      setAssignCoursesLoading(true);
      setError("");
      const res = await facultyAPI.assignCourses(selectedFacultyForCourses.id, selectedCourseIds);
      setStatusMessage(`Assigned ${res.assignedCount || selectedCourseIds.length} courses to ${selectedFacultyForCourses.name}`);
      setShowAssignCoursesModal(false);
      setSelectedFacultyForCourses(null);
      setDeptCourses([]);
      setSelectedCourseIds([]);
    } catch (err) {
      setError(err.message || "Failed to assign courses");
      console.error(err);
    } finally {
      setAssignCoursesLoading(false);
    }
  };

  const handleManageCourses = async (faculty) => {
    try {
      setSelectedFacultyForManage(faculty);
      setShowManageCoursesModal(true);
      setAssignedCourses([]);
      setManageCoursesLoading(true);
      
      // Get assigned courses for this faculty
      const courses = await facultyAPI.getFacultyCourses(faculty.id);
      setAssignedCourses(courses || []);
      setManageCoursesLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load assigned courses");
      setManageCoursesLoading(false);
    }
  };

  const handleUnassignCourse = async (courseId, courseName) => {
    if (!selectedFacultyForManage?.id) return;
    
    // Show confirmation alert
    const confirmed = window.confirm(
      `Are you sure you want to unassign "${courseName}" from ${selectedFacultyForManage.name}?\n\nThis course will be removed from the faculty's portal immediately.`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      setManageCoursesLoading(true);
      setError("");
      
      // Remove the course assignment
      await facultyAPI.removeCourse(selectedFacultyForManage.id, courseId);
      
      // Refresh the assigned courses list to update the UI
      const updatedCourses = await facultyAPI.getFacultyCourses(selectedFacultyForManage.id);
      setAssignedCourses(updatedCourses || []);
      
      // Show success alert
      alert(`✓ Course "${courseName}" has been successfully unassigned from ${selectedFacultyForManage.name}.\n\nThe course has been removed from the faculty portal.`);
      
      setStatusMessage(`Course "${courseName}" unassigned successfully`);
    } catch (err) {
      // Show error alert
      alert(`✗ Failed to unassign course: ${err.message || 'Unknown error'}`);
      setError(err.message || "Failed to unassign course");
      console.error(err);
    } finally {
      setManageCoursesLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full h-full overflow-y-auto p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Faculty Role Management</h2>
        <div className="flex gap-2 items-center">
          {statusMessage && <div className="text-sm text-green-700">{statusMessage}</div>}
          <button
            onClick={() => {
              setSelectedFacultyForExecutive(null);
              setAllFacultiesForSelection(faculties);
              setExecutiveAssignmentMode("manual");
              setManualExecutiveData({
                executiveFullName: "",
                executiveEmail: "",
                executiveCnic: "",
                executivePhone: "",
                executiveAddress: "",
                effectiveFrom: "",
              });
              setShowExecutiveModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-medium whitespace-nowrap"
          >
            Assign/Change Executive
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-1/2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search faculty by name or email"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Department: All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info note about course assignment restrictions */}
      <div className="text-xs text-gray-600 mb-2">
        Note: Course assignment and management are available for Faculty and HOD members. These buttons are disabled for Executive and Coordinator roles.
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg w-full">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  Loading faculty...
                </td>
              </tr>
            )}
            {!loading && filteredFaculties.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  No faculty match the current filters.
                </td>
              </tr>
            )}
            {!loading &&
              filteredFaculties.map((f, idx) => (
                <tr key={f.id}>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-gray-700"
                    title={f.id}
                  >
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{f.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{f.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{getDisplayRole(f)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {departmentById[f.department_id] || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssignCourses(f)}
                        disabled={isRoleProhibitsCourses(f)}
                        title={isRoleProhibitsCourses(f) ? "Courses cannot be assigned to Executive or Coordinator" : "Assign courses"}
                        className={`px-3 py-1.5 text-sm rounded transition ${
                          isRoleProhibitsCourses(f)
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-teal-600 text-white hover:bg-teal-700"
                        }`}
                      >
                        Assign Courses
                      </button>
                      <button
                        onClick={() => handleManageCourses(f)}
                        disabled={isRoleProhibitsCourses(f)}
                        title={isRoleProhibitsCourses(f) ? "Course management only available for Faculty and HOD" : "View and unassign courses"}
                        className={`px-3 py-1.5 text-sm rounded transition ${
                          isRoleProhibitsCourses(f)
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        Manage Courses
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      {/* Assign Courses Modal */}
      {showAssignCoursesModal && selectedFacultyForCourses && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl my-8 transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Assign Courses</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Department: {departmentById[selectedFacultyForCourses.department_id] || "-"}
                </p>
                <p className="text-sm text-gray-500">Faculty: {selectedFacultyForCourses.name} ({selectedFacultyForCourses.email})</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignCoursesModal(false);
                  setSelectedFacultyForCourses(null);
                  setDeptCourses([]);
                  setSelectedCourseIds([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Courses List */}
            {assignCoursesLoading ? (
              <div className="text-center py-8 text-gray-600">Loading courses...</div>
            ) : deptCourses.length === 0 ? (
              <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                No courses found for this department.
              </div>
            ) : (
              <div className="border border-gray-200 rounded">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 max-h-80 overflow-y-auto">
                  {deptCourses.map((course) => (
                    <label key={course.id} className="flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCourseIds.includes(course.id)}
                        onChange={() => toggleCourseSelection(course.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{course.name}</p>
                        <p className="text-xs text-gray-500">Code: {course.code || "N/A"} • Credit Hours: {course.credit_hours}</p>
                        {course.semester?.number && (
                          <p className="text-xs text-gray-400">Semester: {course.semester.number}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowAssignCoursesModal(false);
                  setSelectedFacultyForCourses(null);
                  setDeptCourses([]);
                  setSelectedCourseIds([]);
                }}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignCourses}
                disabled={assignCoursesLoading || selectedCourseIds.length === 0}
                className={`px-6 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 transition-all duration-200 ${
                  assignCoursesLoading || selectedCourseIds.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg"
                }`}
              >
                {assignCoursesLoading ? "Assigning..." : `Assign ${selectedCourseIds.length} Course(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Courses Modal */}
      {showManageCoursesModal && selectedFacultyForManage && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-2xl my-8 transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Manage Courses</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Faculty: {selectedFacultyForManage.name} ({selectedFacultyForManage.email})
                </p>
                <p className="text-sm text-gray-500">
                  Department: {departmentById[selectedFacultyForManage.department_id] || "-"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowManageCoursesModal(false);
                  setSelectedFacultyForManage(null);
                  setAssignedCourses([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Assigned Courses List */}
            {manageCoursesLoading ? (
              <div className="text-center py-8 text-gray-600">Loading assigned courses...</div>
            ) : assignedCourses.length === 0 ? (
              <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                No courses assigned to this faculty yet.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Assigned Courses ({assignedCourses.length})
                  </p>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {assignedCourses.map((item) => {
                    const course = item.course;
                    if (!course) return null;
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{course.name}</p>
                          <div className="flex gap-4 mt-1">
                            <p className="text-sm text-gray-600">Code: {course.code || "N/A"}</p>
                            <p className="text-sm text-gray-600">Credit Hours: {course.credit_hours}</p>
                            {course.semester?.number && (
                              <p className="text-sm text-gray-600">Semester: {course.semester.number}</p>
                            )}
                          </div>
                          {item.student_count !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              Enrolled Students: {item.student_count}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Assigned on: {new Date(item.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUnassignCourse(course.id, course.name)}
                          disabled={manageCoursesLoading}
                          className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Unassign
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowManageCoursesModal(false);
                  setSelectedFacultyForManage(null);
                  setAssignedCourses([]);
                }}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Executive Modal */}
      {showExecutiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl my-8 transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Assign Executive Role
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Only one executive allowed for the entire university
                </p>
              </div>
              <button
                onClick={() => {
                  setShowExecutiveModal(false);
                  setSelectedFacultyForExecutive(null);
                  setManualExecutiveData({
                    executiveFullName: "",
                    executiveEmail: "",
                    executiveCnic: "",
                    executivePhone: "",
                    executiveAddress: "",
                    effectiveFrom: "",
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Current Executive Info */}
            {currentExecutive && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-gray-600">Current Executive:</p>
                <p className="font-semibold text-blue-900">{currentExecutive.faculty?.name || currentExecutive.executive_full_name || currentExecutive.name}</p>
                <p className="text-sm text-blue-800">{currentExecutive.faculty?.email || currentExecutive.executive_email || currentExecutive.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  (Will be changed when new executive is assigned)
                </p>
              </div>
            )}

            {/* Manual Assignment Form */}
            <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Executive Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Executive full name"
                    value={manualExecutiveData.executiveFullName}
                    onChange={(e) =>
                      setManualExecutiveData({ ...manualExecutiveData, executiveFullName: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Executive Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Executive email"
                    value={manualExecutiveData.executiveEmail}
                    onChange={(e) =>
                      setManualExecutiveData({ ...manualExecutiveData, executiveEmail: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Executive CNIC Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter CNIC number"
                    value={manualExecutiveData.executiveCnic}
                    onChange={(e) =>
                      setManualExecutiveData({ ...manualExecutiveData, executiveCnic: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Executive Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={manualExecutiveData.executivePhone}
                    onChange={(e) =>
                      setManualExecutiveData({ ...manualExecutiveData, executivePhone: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Address
                  </label>
                  <textarea
                    placeholder="Enter address"
                    value={manualExecutiveData.executiveAddress}
                    onChange={(e) =>
                      setManualExecutiveData({ ...manualExecutiveData, executiveAddress: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-indigo-600"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Effective From Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={manualExecutiveData.effectiveFrom}
                    onChange={(e) =>
                      setManualExecutiveData({ ...manualExecutiveData, effectiveFrom: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-indigo-600"
                  />
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowExecutiveModal(false);
                  setSelectedFacultyForExecutive(null);
                  setManualExecutiveData({
                    executiveFullName: "",
                    executiveEmail: "",
                    executiveCnic: "",
                    executivePhone: "",
                    executiveAddress: "",
                    effectiveFrom: "",
                  });
                }}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExecutiveAssignment}
                disabled={executiveLoading}
                className={`px-6 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 transition-all duration-200 ${
                  executiveLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                }`}
              >
                {executiveLoading ? "Assigning..." : "Assign Executive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyRoleManagement;
