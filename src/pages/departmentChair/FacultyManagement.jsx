import { useState } from "react";
import { Search, UserPlus, BookOpen, Eye, X } from "lucide-react";

export default function FacultyManagement() {
  const [facultyList, setFacultyList] = useState([
    { id: 1, name: "Dr. Sarah Khan", email: "sarah@university.edu", courses: 3, workload: 9, department: "BBA" },
    { id: 2, name: "Dr. Ahmed Ali", email: "ahmed@university.edu", courses: 2, workload: 6, department: "BBA" },
    { id: 3, name: "Dr. Hamza Yousaf", email: "hamza@university.edu", courses: 4, workload: 12, department: "BBA" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    courses: "",
    workload: "",
    department: ""
  });

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFaculty = () => {
    if (!newFaculty.name || !newFaculty.email || !newFaculty.department) {
      alert("Please fill all required fields!");
      return;
    }

    const id = facultyList.length ? facultyList[facultyList.length - 1].id + 1 : 1;
    setFacultyList([...facultyList, { ...newFaculty, id, courses: Number(newFaculty.courses), workload: Number(newFaculty.workload) }]);
    setShowModal(false);
    setNewFaculty({ name: "", email: "", courses: "", workload: "", department: "" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate__animated animate__fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Faculty Management</h1>
          <p className="text-gray-500">Manage and monitor faculty members in your department</p>
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
                <tr key={faculty.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}>
                  <td className="px-6 py-4 font-medium text-gray-800">{faculty.name}</td>
                  <td className="px-6 py-4 text-gray-600">{faculty.email}</td>
                  <td className="px-6 py-4 text-center text-gray-800 font-semibold">{faculty.courses}</td>
                  <td className="px-6 py-4 text-center text-gray-800 font-semibold">{faculty.workload}</td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs shadow-sm transition-all" title="View Faculty">
                      <Eye size={14} /> View
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs shadow-sm transition-all" title="Assign Course">
                      <BookOpen size={14} /> Assign
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

      {/* Add Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Faculty</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newFaculty.name}
                onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                className="border px-3 py-2 rounded-md outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={newFaculty.email}
                onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                className="border px-3 py-2 rounded-md outline-none"
              />
              <input
                type="number"
                placeholder="Number of Courses"
                value={newFaculty.courses}
                onChange={(e) => setNewFaculty({ ...newFaculty, courses: e.target.value })}
                className="border px-3 py-2 rounded-md outline-none"
              />
              <input
                type="number"
                placeholder="Workload (CrHr)"
                value={newFaculty.workload}
                onChange={(e) => setNewFaculty({ ...newFaculty, workload: e.target.value })}
                className="border px-3 py-2 rounded-md outline-none"
              />
              <input
                type="text"
                placeholder="Department"
                value={newFaculty.department}
                onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                className="border px-3 py-2 rounded-md outline-none"
              />
              <button
                onClick={handleAddFaculty}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Add Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
