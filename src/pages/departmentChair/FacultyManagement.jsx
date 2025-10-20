import { useState } from "react";
import {
  Search,
  UserPlus,
  BookOpen,
  Eye,
  X,
  CheckCircle,
  Edit3,
  Trash2, // 🗑️ Added for remove icon
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
      assignedCourses: ["Marketing 101", "Business Ethics", "Finance Basics"],
    },
    {
      id: 2,
      name: "Dr. Ahmed Ali",
      email: "ahmed@university.edu",
      courses: 2,
      workload: 6,
      department: "BBA",
      assignedCourses: ["Accounting I", "Microeconomics"],
    },
    {
      id: 3,
      name: "Dr. Hamza Yousaf",
      email: "hamza@university.edu",
      courses: 4,
      workload: 12,
      department: "BBA",
      assignedCourses: [
        "Macroeconomics",
        "Business Law",
        "Statistics",
        "Finance II",
      ],
    },
  ]);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    courses: "",
    workload: "",
    department: "",
  });
  const [errors, setErrors] = useState({});
  const [viewFaculty, setViewFaculty] = useState(null);
  const [assignFaculty, setAssignFaculty] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseWorkload, setCourseWorkload] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null); // 🆕 for remove modal

  // Example courses
  const availableCourses = [
    "Principles of Management",
    "Business Communication",
    "Marketing 101",
    "Financial Accounting",
    "Business Ethics",
  ];

  // Filter search
  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!newFaculty.name.trim()) newErrors.name = "Name is required";
    if (!newFaculty.email.trim()) newErrors.email = "Email is required";
    if (!newFaculty.department.trim())
      newErrors.department = "Department is required";
    return newErrors;
  };

  // Add Faculty
  const handleAddFaculty = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const id = facultyList.length
      ? facultyList[facultyList.length - 1].id + 1
      : 1;
    setFacultyList([
      ...facultyList,
      {
        ...newFaculty,
        id,
        courses: Number(newFaculty.courses) || 0,
        workload: Number(newFaculty.workload) || 0,
        assignedCourses: [],
      },
    ]);

    setNewFaculty({ name: "", email: "", courses: "", workload: "", department: "" });
    setErrors({});
    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Assign Course
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

    setSelectedCourse("");
    setCourseWorkload("");
    setAssignFaculty(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Update faculty (View modal edit)
  const handleUpdateFaculty = (updated) => {
    setFacultyList((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
    setViewFaculty(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // 🆕 Remove Faculty
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

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105"
        >
          <UserPlus size={18} />
          Add Faculty
        </button>
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

      {/* Success Toast */}
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
                      <BookOpen size={14} /> Assign
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

      {/* 🆕 Remove Confirmation Modal */}
      {confirmRemove && (
        <Modal title="Confirm Removal" onClose={() => setConfirmRemove(null)}>
          <p className="text-gray-700 mb-4">
            Are you sure you want to remove{" "}
            <span className="font-semibold">{confirmRemove.name}</span> from
            your department?
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
        <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
        {children}
      </div>
    </div>
  );
}
