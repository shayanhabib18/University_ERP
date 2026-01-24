import React, { useEffect, useMemo, useState } from "react";
import { facultyAPI, departmentAPI, semesterAPI, courseAPI } from "../../services/api";

const roleOptions = [
  { value: "ALL", label: "Role: All" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "DEPT_CHAIR", label: "Department Chair" },
  { value: "COORDINATOR", label: "Coordinator" },
  { value: "FACULTY", label: "Faculty" },
];

const FacultyRoleManagement = () => {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
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
  const [executiveAssignmentMode, setExecutiveAssignmentMode] = useState("select_faculty");
  const [manualExecutiveData, setManualExecutiveData] = useState({
    executiveFullName: "",
    executiveEmail: "",
    effectiveFrom: "",
  });
  const [executiveLoading, setExecutiveLoading] = useState(false);
  const [allFacultiesForSelection, setAllFacultiesForSelection] = useState([]);
  const [executiveSearchQuery, setExecutiveSearchQuery] = useState("");
  const [currentExecutive, setCurrentExecutive] = useState(null);

  // Assign Courses Modal States
  const [showAssignCoursesModal, setShowAssignCoursesModal] = useState(false);
  const [selectedFacultyForCourses, setSelectedFacultyForCourses] = useState(null);
  const [deptCourses, setDeptCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [assignCoursesLoading, setAssignCoursesLoading] = useState(false);

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
    return faculties
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
  }, [faculties, search, roleFilter, deptFilter]);

  const handleAssignExecutive = async (faculty) => {
    setSelectedFacultyForExecutive(faculty);
    setAllFacultiesForSelection(faculties);
    setExecutiveAssignmentMode("select_faculty");
    setManualExecutiveData({ executiveFullName: "", executiveEmail: "", effectiveFrom: "" });
    setShowExecutiveModal(true);
  };

  const handleConfirmExecutiveAssignment = async () => {
    if (executiveAssignmentMode === "select_faculty") {
      if (!selectedFacultyForExecutive?.id) {
        setError("Please select a faculty member");
        return;
      }
    } else if (executiveAssignmentMode === "manual") {
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
    }

    try {
      setExecutiveLoading(true);
      setError("");
      const payload = {
        mode: executiveAssignmentMode,
        effectiveFrom: manualExecutiveData.effectiveFrom || null,
      };

      if (executiveAssignmentMode === "select_faculty") {
        payload.facultyId = selectedFacultyForExecutive.id;
      } else if (executiveAssignmentMode === "manual") {
        payload.executiveFullName = manualExecutiveData.executiveFullName.trim();
        payload.executiveEmail = manualExecutiveData.executiveEmail.trim();
      }

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
      setManualExecutiveData({ executiveFullName: "", executiveEmail: "", effectiveFrom: "" });
      setExecutiveSearchQuery("");
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
    return role === "EXECUTIVE" || role === "DEPT_CHAIR" || f.is_hod === true;
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Faculty Role Management</h2>
        <div className="flex gap-2 items-center">
          {statusMessage && <div className="text-sm text-green-700">{statusMessage}</div>}
          <button
            onClick={() => {
              setSelectedFacultyForExecutive(null);
              setAllFacultiesForSelection(faculties);
              setExecutiveAssignmentMode("select_faculty");
              setManualExecutiveData({ executiveFullName: "", executiveEmail: "", effectiveFrom: "" });
              setShowExecutiveModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-medium whitespace-nowrap"
          >
            Assign Executive
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
        Note: Assign Courses is only available for regular faculty. For Executive, Department Chair, and HOD roles, the button is disabled.
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
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
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{f.role || "Unassigned"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {departmentById[f.department_id] || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleAssignCourses(f)}
                      disabled={isRoleProhibitsCourses(f)}
                      title={isRoleProhibitsCourses(f) ? "Courses can be assigned only to regular faculty" : "Assign courses"}
                      className={`px-4 py-2 rounded transition ${
                        isRoleProhibitsCourses(f)
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                    >
                      Assign Courses
                    </button>
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
                  setManualExecutiveData({ executiveFullName: "", executiveEmail: "", effectiveFrom: "" });
                  setExecutiveSearchQuery("");
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

            {/* Assignment Mode Tabs */}
            <div className="mb-6">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mx-auto">
                <button
                  onClick={() => {
                    setExecutiveAssignmentMode("select_faculty");
                    setExecutiveSearchQuery("");
                  }}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    executiveAssignmentMode === "select_faculty"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Select Faculty
                </button>
                <button
                  onClick={() => setExecutiveAssignmentMode("manual")}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    executiveAssignmentMode === "manual"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            {/* Mode 1: Select from Faculty List */}
            {executiveAssignmentMode === "select_faculty" && (
              <div className="space-y-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Select a faculty member to assign as Executive:
                </p>

                {/* Search Box */}
                <input
                  type="text"
                  placeholder="Search faculty by name or email..."
                  value={executiveSearchQuery}
                  onChange={(e) => setExecutiveSearchQuery(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-indigo-600"
                />

                {allFacultiesForSelection.length === 0 ? (
                  <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800">No faculty members available</p>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded max-h-64 overflow-y-auto">
                    {allFacultiesForSelection
                      .filter((faculty) =>
                        faculty.name.toLowerCase().includes(executiveSearchQuery.toLowerCase()) ||
                        faculty.email.toLowerCase().includes(executiveSearchQuery.toLowerCase())
                      )
                      .map((faculty) => (
                        <label
                          key={faculty.id}
                            className={`flex items-center gap-3 p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                            selectedFacultyForExecutive?.id === faculty.id ? "bg-indigo-50" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="executive-select"
                            value={faculty.id}
                            checked={selectedFacultyForExecutive?.id === faculty.id}
                            onChange={() => setSelectedFacultyForExecutive(faculty)}
                            className="cursor-pointer"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{faculty.name}</p>
                            <p className="text-sm text-gray-500">{faculty.email}</p>
                            <p className="text-xs text-gray-400">{faculty.designation}</p>
                          </div>
                        </label>
                      ))}
                  </div>
                )}

                {/* Effective From Date */}
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
            )}

            {/* Mode 2: Manual Assignment */}
            {executiveAssignmentMode === "manual" && (
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
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowExecutiveModal(false);
                  setSelectedFacultyForExecutive(null);
                  setManualExecutiveData({ executiveFullName: "", executiveEmail: "", effectiveFrom: "" });
                  setExecutiveSearchQuery("");
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
