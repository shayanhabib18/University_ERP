import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from "lucide-react";
import {
  departmentAPI,
  semesterAPI,
  courseAPI,
  studentAPI,
  facultyAPI,
} from "../../services/api";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAssignHODModal, setShowAssignHODModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: "", code: "" });
  const [newCourse, setNewCourse] = useState({
    semester: "",
    name: "",
    code: "",
    credit_hours: "",
    preReq: "",
  });
  const [facultyList, setFacultyList] = useState([]);
  const [selectedHOD, setSelectedHOD] = useState(null);
  const [currentHOD, setCurrentHOD] = useState(null);
  const [hodLoading, setHODLoading] = useState(false);

  // HOD Assignment Mode States
  const [hodAssignmentMode, setHODAssignmentMode] = useState("select_faculty"); // "select_faculty" | "manual"
  const [manualHODData, setManualHODData] = useState({
    hodFullName: "",
    hodEmail: "",
    effectiveFrom: "",
  });
  const [hodSearchQuery, setHODSearchQuery] = useState("");

  // Load departments from backend
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentAPI.getAll();
      const list = Array.isArray(data) ? data : [];

      // Fetch student counts per department
      const counts = await Promise.all(
        list.map(async (dept) => {
          try {
            const students = await studentAPI.getByDepartment(dept.id);
            return Array.isArray(students) ? students.length : 0;
          } catch (err) {
            console.error(
              "Failed to load students for department",
              dept.id,
              err,
            );
            return 0;
          }
        }),
      );

      const withCounts = list.map((dept, idx) => ({
        ...dept,
        students: counts[idx],
      }));
      setDepartments(withCounts);
    } catch (error) {
      console.error("Failed to load departments:", error);
      alert("Failed to load departments from server");
    } finally {
      setLoading(false);
    }
  };

  // HOD functions
  const loadFacultyForDepartment = async (deptId) => {
    try {
      setHODLoading(true);
      const faculty = await facultyAPI.getByDepartment(deptId);
      setFacultyList(Array.isArray(faculty) ? faculty : []);

      // Load current HOD
      const hod = await departmentAPI.getHOD(deptId);
      setCurrentHOD(hod);
    } catch (error) {
      console.error("Failed to load faculty:", error);
      alert("Failed to load faculty list");
    } finally {
      setHODLoading(false);
    }
  };

  const handleOpenHODModal = async (dept) => {
    setSelectedDept(dept);
    setSelectedHOD(null);
    setCurrentHOD(null);
    setShowAssignHODModal(true);
    // Load faculty data immediately when opening modal
    await loadFacultyForDepartment(dept.id);
  };

  const handleAssignHOD = async () => {
    if (hodAssignmentMode === "select_faculty") {
      if (!selectedHOD) {
        alert("Please select a faculty member to assign as HOD");
        return;
      }
    } else if (hodAssignmentMode === "manual") {
      if (!manualHODData.hodFullName.trim() || !manualHODData.hodEmail.trim()) {
        alert("Please enter HOD Full Name and Email");
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(manualHODData.hodEmail)) {
        alert("Please enter a valid email address");
        return;
      }
    }

    if (!selectedDept?.id) {
      alert("Department information is missing");
      return;
    }

    try {
      setHODLoading(true);
      const payload = {
        mode: hodAssignmentMode,
        effectiveFrom: manualHODData.effectiveFrom || null,
      };

      if (hodAssignmentMode === "select_faculty") {
        payload.facultyId = selectedHOD;
      } else if (hodAssignmentMode === "manual") {
        payload.hodFullName = manualHODData.hodFullName.trim();
        payload.hodEmail = manualHODData.hodEmail.trim();
      }

      await departmentAPI.assignHOD(selectedDept.id, payload);
      alert(`HOD assigned successfully!`);

      // Reload departments to update the UI
      await loadDepartments();
      setShowAssignHODModal(false);
      setSelectedHOD(null);
      setCurrentHOD(null);
      setManualHODData({ hodFullName: "", hodEmail: "", effectiveFrom: "" });
    } catch (error) {
      console.error("Failed to assign HOD:", error);
      alert(error.message || "Failed to assign HOD");
    } finally {
      setHODLoading(false);
    }
  };

  // Department functions
  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim() || !newDepartment.code.trim()) {
      alert("Please enter both Department Name and Code.");
      return;
    }

    try {
      await departmentAPI.create({
        name: newDepartment.name.trim(),
        code: newDepartment.code.toUpperCase().trim(),
      });
      await loadDepartments();
      setNewDepartment({ name: "", code: "" });
      setShowAddDeptModal(false);
      alert("Department added successfully!");
    } catch (error) {
      console.error("Failed to add department:", error);
      alert("Failed to add department");
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDept.name.trim() || !editingDept.code.trim()) {
      alert("Please enter both Department Name and Code.");
      return;
    }

    try {
      await departmentAPI.update(editingDept.id, {
        name: editingDept.name.trim(),
        code: editingDept.code.toUpperCase().trim(),
      });
      await loadDepartments();
      setEditingDept(null);
      alert("Department updated successfully!");
    } catch (error) {
      console.error("Failed to update department:", error);
      alert("Failed to update department");
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await departmentAPI.delete(id);
        await loadDepartments();
        if (selectedDept?.id === id) {
          setSelectedDept(null);
        }
        alert("Department deleted successfully!");
      } catch (error) {
        console.error("Failed to delete department:", error);
        alert("Failed to delete department");
      }
    }
  };

  const handleEditDepartment = (dept) => {
    setEditingDept({ ...dept });
  };

  const handleSaveDepartment = async () => {
    await handleUpdateDepartment();
  };

  const handleCancelEdit = () => {
    setEditingDept(null);
  };

  // Course and Semester functions
  const handleAddCourse = async () => {
    if (
      !newCourse.semester ||
      !newCourse.name.trim() ||
      !newCourse.code.trim() ||
      !newCourse.credit_hours
    ) {
      alert("Please fill in all required course fields.");
      return;
    }

    try {
      // First, check if semester exists, if not create it
      const semesterNum = parseInt(newCourse.semester, 10);

      if (Number.isNaN(semesterNum)) {
        alert("Semester must be a valid number.");
        return;
      }

      let semestersList = await semesterAPI.getByDepartment(selectedDept.id);
      semestersList = semestersList || [];

      let semesterId;
      const existingSemester = semestersList.find(
        (s) => Number(s.number) === semesterNum,
      );

      if (!existingSemester) {
        // Create new semester
        const newSemester = await semesterAPI.create({
          department_id: selectedDept.id,
          number: semesterNum,
        });
        semesterId = newSemester.id;
      } else {
        semesterId = existingSemester.id;
      }

      // Now add the course to the semester
      await courseAPI.create({
        semester_id: semesterId,
        name: newCourse.name.trim(),
        code: newCourse.code.trim(),
        credit_hours: parseInt(newCourse.credit_hours, 10),
        crhr: parseInt(newCourse.credit_hours, 10), // ensure backend mapping
        pre_req: newCourse.preReq?.trim() || null,
      });

      // Reload department details
      await loadDepartmentDetails(selectedDept.id);

      setNewCourse({
        semester: "",
        name: "",
        code: "",
        credit_hours: "",
        preReq: "",
      });
      setShowAddCourseModal(false);
      alert("Course added successfully!");
    } catch (error) {
      console.error("Failed to add course:", error);
      alert("Failed to add course");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!courseId || !selectedDept?.id) return;
    if (!window.confirm("Delete this course?")) return;
    try {
      await courseAPI.delete(courseId);
      await loadDepartmentDetails(selectedDept.id);
      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert(error.message || "Failed to delete course");
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    const creditValue = parseInt(
      editingCourse.crhr || editingCourse.credit_hours,
      10,
    );
    if (
      !editingCourse.name?.trim() ||
      !editingCourse.code?.trim() ||
      Number.isNaN(creditValue)
    ) {
      alert("Please fill all required course fields.");
      return;
    }

    try {
      await courseAPI.update(editingCourse.id, {
        name: editingCourse.name.trim(),
        code: editingCourse.code.trim(),
        crhr: creditValue,
        credit_hours: creditValue,
        pre_req: editingCourse.preReq || editingCourse.pre_req || null,
        semester_id:
          editingCourse.semester_id ||
          editingCourse.semesterId ||
          selectedDept.semesters.find(
            (s) => s.number === editingCourse.semesterNumber,
          )?.id,
      });

      await loadDepartmentDetails(selectedDept.id);
      setEditingCourse(null);
      alert("Course updated successfully!");
    } catch (error) {
      console.error("Failed to update course:", error);
      alert(error.message || "Failed to update course");
    }
  };

  // Load department with semesters and courses
  const loadDepartmentDetails = async (deptId) => {
    try {
      const [semesters, studentsInDept] = await Promise.all([
        semesterAPI.getByDepartment(deptId),
        studentAPI.getByDepartment(deptId).catch(() => []),
      ]);

      // Load courses for each semester
      const semestersWithCourses = await Promise.all(
        (semesters || []).map(async (sem) => {
          const courses = await courseAPI.getBySemester(sem.id);
          return {
            ...sem,
            courses: (courses || []).map((c) => ({
              ...c,
              credit_hours: c.credit_hours ?? c.crhr, // normalize for UI
            })),
          };
        }),
      );

      // Update selected department with fresh counts
      const dept = departments.find((d) => d.id === deptId) || {};
      setSelectedDept({
        ...dept,
        students: Array.isArray(studentsInDept) ? studentsInDept.length : 0,
        semesters: semestersWithCourses.sort((a, b) => a.number - b.number),
      });
    } catch (error) {
      console.error("Failed to load department details:", error);
      alert("Failed to load department details");
    }
  };

  // Update handleViewDepartment to load details
  const handleViewDepartmentWithDetails = async (dept) => {
    // Set initial state with empty semesters to show the view immediately
    setSelectedDept({
      ...dept,
      students: dept.students || 0,
      semesters: [],
    });
    setExpandedSemesters({});
    // Then load the actual details
    await loadDepartmentDetails(dept.id);
  };

  // Toggle semester expansion
  const toggleSemester = (semId) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semId]: !prev[semId],
    }));
  };

  const handleViewDepartment = (dept) => {
    setSelectedDept(dept);
    setExpandedSemesters({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading departments...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">
        {selectedDept
          ? `${selectedDept.name} (${selectedDept.code})`
          : "Department Management"}
      </h1>

      {!selectedDept ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Departments</h2>
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={18} /> Add Department
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Chair
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assign/Change HOD
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dept, index) => (
                  <tr key={dept.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingDept?.id === dept.id ? (
                        <input
                          type="text"
                          value={editingDept.name}
                          onChange={(e) =>
                            setEditingDept({
                              ...editingDept,
                              name: e.target.value,
                            })
                          }
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        dept.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingDept?.id === dept.id ? (
                        <input
                          type="text"
                          value={editingDept.code}
                          onChange={(e) =>
                            setEditingDept({
                              ...editingDept,
                              code: e.target.value,
                            })
                          }
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        dept.code
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.chair ||
                        dept.chairName ||
                        dept.hod ||
                        dept.hodName ||
                        dept.department_chair ||
                        "Not assigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingDept?.id === dept.id ? (
                        <>
                          <button
                            onClick={handleSaveDepartment}
                            className="text-green-600 hover:text-green-800 mr-3"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 mr-3"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleViewDepartmentWithDetails(dept)
                            }
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="View Department"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditDepartment(dept)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Edit Department"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Department"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleOpenHODModal(dept)}
                        title="Assign or change HOD"
                      >
                        Assign/Change HOD
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedDept(null)}
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              ← Back to Departments
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={18} /> Add Course
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">
                Total Students
              </h3>
              <p className="text-2xl font-semibold">
                {selectedDept?.students || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">
                Total Semesters
              </h3>
              <p className="text-2xl font-semibold">
                {selectedDept?.semesters?.length || 0}
              </p>
            </div>
          </div>

          {!selectedDept?.semesters || selectedDept.semesters.length === 0 ? (
            <p className="text-gray-500 text-center">
              No semesters added yet. Click "Add Course" to create your first
              course and semester.
            </p>
          ) : (
            selectedDept.semesters.map((semester) => (
              <div
                key={semester.number}
                className="mb-4 border border-gray-300 rounded-lg"
              >
                <div
                  className="flex justify-between items-center cursor-pointer px-4 py-2 bg-indigo-100 rounded-t-lg"
                  onClick={() => toggleSemester(semester.number)}
                >
                  <h4 className="text-lg font-semibold text-indigo-700">
                    Semester {semester.number}
                  </h4>
                  {expandedSemesters[semester.number] ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>

                {expandedSemesters[semester.number] && (
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-indigo-50">
                      <tr>
                        <th className="px-4 py-2">Course Name</th>
                        <th className="px-4 py-2">Course Code</th>
                        <th className="px-4 py-2">CRHR</th>
                        <th className="px-4 py-2">Pre-requisite</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.courses.map((course) => (
                        <tr
                          key={course.id}
                          className="border-t border-gray-200"
                        >
                          <td className="px-4 py-2">{course.name}</td>
                          <td className="px-4 py-2">{course.code}</td>
                          <td className="px-4 py-2">{course.credit_hours}</td>
                          <td className="px-4 py-2">
                            {course.pre_req || "None"}
                          </td>
                          <td className="px-4 py-2 flex gap-3">
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit Course"
                              onClick={() =>
                                setEditingCourse({
                                  ...course,
                                  semesterNumber: semester.number,
                                  semester_id:
                                    course.semester_id || semester.id,
                                  crhr: course.credit_hours ?? course.crhr,
                                })
                              }
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="Delete Course"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {semester.courses.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-4 text-gray-500"
                          >
                            No courses in this semester.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Add New Department</h3>
            <input
              type="text"
              placeholder="Department Name"
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, name: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />
            <input
              type="text"
              placeholder="Department Code"
              value={newDepartment.code}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, code: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowAddDeptModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDepartment}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Add New Course</h3>

            <input
              type="number"
              min={1}
              max={8}
              placeholder="Semester Number (1-8)"
              value={newCourse.semester}
              onChange={(e) =>
                setNewCourse({ ...newCourse, semester: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <input
              type="text"
              placeholder="Pre-requisite Course Code (optional)"
              value={newCourse.preReq}
              onChange={(e) =>
                setNewCourse({ ...newCourse, preReq: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <input
              type="text"
              placeholder="Course Name"
              value={newCourse.name}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <input
              type="text"
              placeholder="Course Code"
              value={newCourse.code}
              onChange={(e) =>
                setNewCourse({ ...newCourse, code: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <input
              type="number"
              min={1}
              max={6}
              placeholder="Credit Hours (CRHR)"
              value={newCourse.credit_hours}
              onChange={(e) =>
                setNewCourse({ ...newCourse, credit_hours: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Course</h3>

            <input
              type="text"
              placeholder="Course Name"
              value={editingCourse.name}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, name: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <input
              type="text"
              placeholder="Course Code"
              value={editingCourse.code}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, code: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <input
              type="text"
              placeholder="Pre-requisite Course Code (optional)"
              value={editingCourse.preReq}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, preReq: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <input
              type="number"
              min={1}
              max={6}
              placeholder="Credit Hours (CRHR)"
              value={editingCourse.crhr || ""}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, crhr: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCourse}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign HOD Modal - Styled Version */}
      {showAssignHODModal && selectedDept && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl my-8 transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Assign Head of Department
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDept.name} • {selectedDept.code}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignHODModal(false);
                  setSelectedHOD(null);
                  setCurrentHOD(null);
                  setManualHODData({
                    hodFullName: "",
                    hodEmail: "",
                    effectiveFrom: "",
                  });
                  setHODSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current HOD Display */}
            {currentHOD && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Current HOD
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentHOD.name}
                    </p>
                    <p className="text-sm text-blue-700 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {currentHOD.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Mode Tabs */}
            <div className="mb-6">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mx-auto">
                <button
                  onClick={() => {
                    setHODAssignmentMode("select_faculty");
                    setHODSearchQuery("");
                  }}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    hodAssignmentMode === "select_faculty"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.25l-.75.75-.75-.75.75-.75.75.75z"
                    />
                  </svg>
                  Select Faculty
                </button>
                <button
                  onClick={() => setHODAssignmentMode("manual")}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    hodAssignmentMode === "manual"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Manual Entry
                </button>
              </div>
            </div>

            {/* Mode 1: Select from Faculty List */}
            {hodAssignmentMode === "select_faculty" && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Select a faculty member to assign as HOD:
                  </p>

                  {/* Search Box */}
                  <div className="relative mb-4">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search faculty by name or email..."
                      value={hodSearchQuery}
                      onChange={(e) => setHODSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>

                  {hodLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                      <p className="text-gray-500 mt-2">
                        Loading faculty members...
                      </p>
                    </div>
                  ) : facultyList.length === 0 ? (
                    <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <svg
                        className="w-12 h-12 text-yellow-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <p className="text-yellow-800 font-medium">
                        No faculty members found
                      </p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Add faculty members to this department first
                      </p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                      {facultyList
                        .filter(
                          (faculty) =>
                            faculty.name
                              .toLowerCase()
                              .includes(hodSearchQuery.toLowerCase()) ||
                            faculty.email
                              .toLowerCase()
                              .includes(hodSearchQuery.toLowerCase()),
                        )
                        .map((faculty) => (
                          <label
                            key={faculty.id}
                            className={`flex items-center gap-3 p-4 border-b border-gray-100 transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                              selectedHOD === faculty.id
                                ? "bg-indigo-50 border-l-4 border-l-indigo-500"
                                : ""
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <input
                                type="radio"
                                name="hod-select"
                                value={faculty.id}
                                checked={selectedHOD === faculty.id}
                                onChange={(e) => setSelectedHOD(e.target.value)}
                                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-full cursor-pointer"
                              />
                            </div>
                            <div className="flex items-center gap-3 flex-1">
                              <div className="bg-indigo-100 p-2 rounded-lg">
                                <svg
                                  className="w-6 h-6 text-indigo-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p className="font-medium text-gray-900">
                                    {faculty.name}
                                  </p>
                                  {faculty.designation && (
                                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                      {faculty.designation}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {faculty.email}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Manual Assignment */}
            {hodAssignmentMode === "manual" && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Department Information
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedDept.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Code: {selectedDept.code}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HOD Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter HOD's full name"
                      value={manualHODData.hodFullName}
                      onChange={(e) =>
                        setManualHODData({
                          ...manualHODData,
                          hodFullName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HOD Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter HOD's email address"
                      value={manualHODData.hodEmail}
                      onChange={(e) =>
                        setManualHODData({
                          ...manualHODData,
                          hodEmail: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Effective From Date (Common for both modes) */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Effective From Date (Optional)
                </span>
              </label>
              <input
                type="date"
                value={manualHODData.effectiveFrom}
                onChange={(e) =>
                  setManualHODData({
                    ...manualHODData,
                    effectiveFrom: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              <p className="text-xs text-gray-500 mt-2">
                Leave empty for immediate effect
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowAssignHODModal(false);
                  // Reset all HOD modal states
                  setSelectedDept(null);
                  setSelectedHOD(null);
                  setCurrentHOD(null);
                  setManualHODData({
                    hodFullName: "",
                    hodEmail: "",
                    effectiveFrom: "",
                  });
                  setHODSearchQuery("");
                  setHODAssignmentMode("select_faculty");
                  setFacultyList([]);
                }}
                className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignHOD}
                disabled={hodLoading}
                className={`px-6 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 transition-all duration-200 ${
                  hodLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                }`}
              >
                {hodLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Assign HOD
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
