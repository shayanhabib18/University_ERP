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
import { departmentAPI, semesterAPI, courseAPI } from "../../services/api";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: "", code: "" });
  const [newCourse, setNewCourse] = useState({
    semester: "",
    name: "",
    code: "",
    credit_hours: "",
  });

  // Load departments from backend
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments:", error);
      alert("Failed to load departments from server");
    } finally {
      setLoading(false);
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
    if (!newCourse.semester || !newCourse.name.trim() || !newCourse.code.trim() || !newCourse.credit_hours) {
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
        (s) => Number(s.number) === semesterNum
      );
      
      if (!existingSemester) {
        // Create new semester
        const newSemester = await semesterAPI.create({
          department_id: selectedDept.id,
          number: semesterNum
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
      });

      // Reload department details
      await loadDepartmentDetails(selectedDept.id);
      
      setNewCourse({ semester: "", name: "", code: "", credit_hours: "" });
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
    const creditValue = parseInt(editingCourse.crhr || editingCourse.credit_hours, 10);
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
          editingCourse.semester_id || editingCourse.semesterId || selectedDept.semesters.find((s) => s.number === editingCourse.semesterNumber)?.id,
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
      const semesters = await semesterAPI.getByDepartment(deptId);
      
      // Load courses for each semester
      const semestersWithCourses = await Promise.all(
        semesters.map(async (sem) => {
          const courses = await courseAPI.getBySemester(sem.id);
          return {
            ...sem,
            courses: (courses || []).map((c) => ({
              ...c,
              credit_hours: c.credit_hours ?? c.crhr, // normalize for UI
            })),
          };
        })
      );

      // Update selected department
      const dept = departments.find(d => d.id === deptId);
      setSelectedDept({
        ...dept,
        students: dept.students || 0,
        semesters: semestersWithCourses.sort((a, b) => a.number - b.number)
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
      semesters: []
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
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                      {dept.students}
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
                            onClick={() => handleViewDepartmentWithDetails(dept)}
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
              <p className="text-2xl font-semibold">{selectedDept?.students || 0}</p>
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
            <p className="text-gray-500 text-center">No semesters added yet. Click "Add Course" to create your first course and semester.</p>
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
                          <td className="px-4 py-2">{course.pre_req || "None"}</td>
                          <td className="px-4 py-2 flex gap-3">
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit Course"
                              onClick={() =>
                                setEditingCourse({
                                  ...course,
                                  semesterNumber: semester.number,
                                  semester_id: course.semester_id || semester.id,
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
    </div>
  );
};

export default DepartmentManagement;
