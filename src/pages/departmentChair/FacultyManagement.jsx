import { useState } from "react";
import {
  Search,
  BookOpen,
  Eye,
  X,
  CheckCircle,
  Trash2,
} from "lucide-react";

export default function FacultyManagement() {
  const [facultyList, setFacultyList] = useState([
    {
      id: 1,
      name: "Dr. Sarah Khan",
      email: "sarah@university.edu",
      courses: 3,
      workload: 9,
      department: "BBA",
      designation: "Associate Professor",
      joinDate: "2018-08-15",
      assignedCourses: ["Marketing 101", "Business Ethics", "Finance Basics"],
    },
    {
      id: 2,
      name: "Dr. Ahmed Ali",
      email: "ahmed@university.edu",
      courses: 2,
      workload: 6,
      department: "BBA",
      designation: "Assistant Professor",
      joinDate: "2020-02-10",
      assignedCourses: ["Accounting I", "Microeconomics"],
    },
  ]);

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
  const handleUnassignCourse = (courseToRemove) => {
    setFacultyList((prev) =>
      prev.map((f) =>
        f.id === assignFaculty.id
          ? {
              ...f,
              assignedCourses: f.assignedCourses.filter(
                (c) => c !== courseToRemove
              ),
              courses: Math.max(f.courses - 1, 0),
              workload: Math.max(f.workload - 3, 0),
            }
          : f
      )
    );

    setAssignFaculty((prev) => ({
      ...prev,
      assignedCourses: prev.assignedCourses.filter(
        (c) => c !== courseToRemove
      ),
      courses: Math.max(prev.courses - 1, 0),
      workload: Math.max(prev.workload - 3, 0),
    }));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
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
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No faculty found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                      <span>{course}</span>
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
                  <li key={i}>{c}</li>
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
