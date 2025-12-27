import React, { useState } from "react";
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

const DepartmentManagement = () => {
  // Sample initial data
  const initialDepartments = [
    {
      id: 1,
      name: "Computer Science",
      code: "CS",
      students: 120,
      semesters: [
        {
          number: 1,
          courses: [
            {
              id: 1,
              name: "Introduction to Programming",
              code: "CS101",
              preReq: "None",
              crhr: 3,
            },
            {
              id: 2,
              name: "Discrete Mathematics",
              code: "MATH101",
              preReq: "None",
              crhr: 4,
            },
          ],
        },
        {
          number: 2,
          courses: [
            { id: 3, name: "Data Structures", code: "CS201", preReq: "CS101", crhr: 3 },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Business Administration",
      code: "BBA",
      students: 85,
      semesters: [
        {
          number: 1,
          courses: [
            {
              id: 4,
              name: "Principles of Management",
              code: "BBA101",
              preReq: "None",
              crhr: 3,
            },
          ],
        },
      ],
    },
  ];

  const [departments, setDepartments] = useState(initialDepartments);
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
    preReq: "None",
    crhr: "",
  });

  // Department functions
  const handleAddDepartment = () => {
    if (!newDepartment.name.trim() || !newDepartment.code.trim()) {
      alert("Please enter both Department Name and Code.");
      return;
    }

    const newDept = {
      id: departments.length ? departments[departments.length - 1].id + 1 : 1,
      name: newDepartment.name.trim(),
      code: newDepartment.code.toUpperCase().trim(),
      students: 0,
      semesters: [],
    };
    setDepartments([...departments, newDept]);
    setNewDepartment({ name: "", code: "" });
    setShowAddDeptModal(false);
  };

  const handleDeleteDepartment = (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments(departments.filter((dept) => dept.id !== id));
      if (selectedDept && selectedDept.id === id) {
        setSelectedDept(null);
      }
    }
  };

  const handleEditDepartment = (dept) => {
    setEditingDept({ ...dept });
  };

  const handleSaveDepartment = () => {
    if (!editingDept.name.trim() || !editingDept.code.trim()) {
      alert("Department name and code cannot be empty");
      return;
    }

    const updatedDepartments = departments.map((dept) =>
      dept.id === editingDept.id ? editingDept : dept
    );

    setDepartments(updatedDepartments);
    if (selectedDept && selectedDept.id === editingDept.id) {
      setSelectedDept(editingDept);
    }
    setEditingDept(null);
  };

  const handleCancelEdit = () => {
    setEditingDept(null);
  };

  // Course functions
  const handleAddCourse = () => {
    if (
      !newCourse.semester ||
      !newCourse.name.trim() ||
      !newCourse.code.trim() ||
      !newCourse.crhr
    ) {
      alert("Please fill in all required course fields.");
      return;
    }

    const updatedDepartments = departments.map((dept) => {
      if (dept.id === selectedDept.id) {
        const semesterNum = parseInt(newCourse.semester, 10);
        const semesterExists = dept.semesters.some(
          (s) => s.number === semesterNum
        );

        const updatedSemesters = semesterExists
          ? dept.semesters.map((sem) => {
              if (sem.number === semesterNum) {
                return {
                  ...sem,
                  courses: [
                    ...sem.courses,
                    {
                      id: Date.now(),
                      name: newCourse.name.trim(),
                      code: newCourse.code.trim(),
                      preReq: newCourse.preReq.trim() || "None",
                      crhr: parseInt(newCourse.crhr, 10),
                    },
                  ],
                };
              }
              return sem;
            })
          : [
              ...dept.semesters,
              {
                number: semesterNum,
                courses: [
                  {
                    id: Date.now(),
                    name: newCourse.name.trim(),
                    code: newCourse.code.trim(),
                    preReq: newCourse.preReq.trim() || "None",
                    crhr: parseInt(newCourse.crhr, 10),
                  },
                ],
              },
            ];

        return {
          ...dept,
          semesters: updatedSemesters.sort((a, b) => a.number - b.number),
        };
      }
      return dept;
    });

    setDepartments(updatedDepartments);
    setSelectedDept(
      updatedDepartments.find((dept) => dept.id === selectedDept.id)
    );
    setNewCourse({
      semester: "",
      name: "",
      code: "",
      preReq: "None",
      crhr: "",
    });
    setShowAddCourseModal(false);
  };

  // View toggle functions
  const toggleSemester = (semesterNumber) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semesterNumber]: !prev[semesterNumber],
    }));
  };

  const handleViewDepartment = (dept) => {
    setSelectedDept(dept);
    setExpandedSemesters({});
  };

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
                            onClick={() => handleViewDepartment(dept)}
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
              <p className="text-2xl font-semibold">{selectedDept.students}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">
                Total Semesters
              </h3>
              <p className="text-2xl font-semibold">
                {selectedDept.semesters.length}
              </p>
            </div>
          </div>

          {selectedDept.semesters.length === 0 ? (
            <p className="text-gray-500 text-center">No semesters added yet.</p>
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
                          <td className="px-4 py-2">{course.crhr}</td>
                          <td className="px-4 py-2">{course.preReq}</td>
                          <td className="px-4 py-2 flex gap-3">
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit Course"
                              onClick={() =>
                                setEditingCourse({
                                  ...course,
                                  semesterNumber: semester.number,
                                  crhr: course.crhr,
                                })
                              }
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="Delete Course"
                              onClick={() => {
                                if (window.confirm("Delete this course?")) {
                                  const updatedDepartments = departments.map(
                                    (dept) => {
                                      if (dept.id === selectedDept.id) {
                                        return {
                                          ...dept,
                                          semesters: dept.semesters.map(
                                            (sem) => {
                                              if (
                                                sem.number === semester.number
                                              ) {
                                                return {
                                                  ...sem,
                                                  courses: sem.courses.filter(
                                                    (c) => c.id !== course.id
                                                  ),
                                                };
                                              }
                                              return sem;
                                            }
                                          ),
                                        };
                                      }
                                      return dept;
                                    }
                                  );
                                  setDepartments(updatedDepartments);
                                  setSelectedDept(
                                    updatedDepartments.find(
                                      (dept) => dept.id === selectedDept.id
                                    )
                                  );
                                }
                              }}
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
              type="text"
              placeholder="Pre-requisite Course Code (optional)"
              value={newCourse.preReq}
              onChange={(e) =>
                setNewCourse({ ...newCourse, preReq: e.target.value })
              }
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 focus:outline-indigo-600"
            />

            <input
              type="number"
              min={1}
              max={6}
              placeholder="Credit Hours (CRHR)"
              value={newCourse.crhr}
              onChange={(e) =>
                setNewCourse({ ...newCourse, crhr: e.target.value })
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
                onClick={() => {
                  const updatedDepartments = departments.map((dept) => {
                    if (dept.id === selectedDept.id) {
                      return {
                        ...dept,
                        semesters: dept.semesters.map((sem) => {
                          if (sem.number === editingCourse.semesterNumber) {
                            return {
                              ...sem,
                              courses: sem.courses.map((c) =>
                                c.id === editingCourse.id ? editingCourse : c
                              ),
                            };
                          }
                          return sem;
                        }),
                      };
                    }
                    return dept;
                  });
                  setDepartments(updatedDepartments);
                  setSelectedDept(
                    updatedDepartments.find(
                      (dept) => dept.id === selectedDept.id
                    )
                  );
                  setEditingCourse(null);
                }}
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
