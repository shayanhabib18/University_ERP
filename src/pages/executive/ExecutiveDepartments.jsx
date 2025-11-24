import { useState } from "react";
import {
  Building2,
  Users,
  UserCheck,
  Eye,
  Edit3,
  X,
  Search,
  TrendingUp,
  BookOpen,
  Mail,
  Phone,
} from "lucide-react";

export default function ExecutiveDepartments() {
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "Computer Science",
      hod: "Dr. Ahmed Raza",
      hodEmail: "ahmed.raza@university.edu",
      hodPhone: "+92-300-1234567",
      students: 320,
      faculty: 18,
      courses: 45,
      avgGPA: 3.6,
      established: "2010",
      sections: {
        Cyber: {
          students: ["Ali", "Hassan", "Saad"],
          faculty: ["Dr. Kamran", "Prof. Zainab"],
        },
        AI: {
          students: ["Ayesha", "Bilal", "Hira"],
          faculty: ["Dr. Sameer", "Ms. Noor"],
        },
        SE: {
          students: ["Zain", "Hammad"],
          faculty: ["Prof. Imran"],
        },
      },
    },
    {
      id: 2,
      name: "Electrical Engineering",
      hod: "Dr. Sara Khan",
      hodEmail: "sara.khan@university.edu",
      hodPhone: "+92-300-1234568",
      students: 270,
      faculty: 15,
      courses: 38,
      avgGPA: 3.4,
      established: "2008",
      sections: {
        Electronics: {
          students: ["Fahad", "Asma"],
          faculty: ["Dr. Shahid", "Engr. Rabia"],
        },
        Power: {
          students: ["Ahmed", "Maira"],
          faculty: ["Prof. Khalid"],
        },
      },
    },
    {
      id: 3,
      name: "Business Administration",
      hod: "Dr. Muhammad Ali",
      hodEmail: "muhammad.ali@university.edu",
      hodPhone: "+92-300-1234569",
      students: 450,
      faculty: 25,
      courses: 52,
      avgGPA: 3.5,
      established: "2012",
      sections: {
        Finance: {
          students: ["Ahmad", "Fatima", "Usman"],
          faculty: ["Dr. Hassan", "Prof. Ayesha"],
        },
        Marketing: {
          students: ["Zara", "Bilal"],
          faculty: ["Dr. Sana"],
        },
      },
    },
  ]);

  const [selectedDept, setSelectedDept] = useState(null);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Save Edited Department
  const handleSaveEdit = () => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === editing.id ? editing : d))
    );
    setEditing(null);
    alert("Department details updated successfully!");
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.hod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Building2 className="text-white" size={28} />
              </div>
              Department Overview
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Manage and monitor all academic departments
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search departments or HOD names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition">
                  {dept.name}
                </h2>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 rounded-lg">
                <Building2 className="text-blue-600" size={20} />
              </div>
            </div>

            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Head of Department</p>
              <p className="font-semibold text-gray-800">{dept.hod}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="text-blue-600" size={16} />
                  <span className="text-xs text-gray-600">Students</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{dept.students}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="text-green-600" size={16} />
                  <span className="text-xs text-gray-600">Faculty</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{dept.faculty}</p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setSelectedDept(dept)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">No departments found matching your search.</p>
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedDept && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 md:p-6 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 md:p-8 relative overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedDept(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-xl shadow-lg">
                  <Building2 className="text-white" size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedDept.name}
                  </h2>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Head of Department
                </h3>
                <p className="text-xl font-bold text-gray-800 mb-2">{selectedDept.hod}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {selectedDept.hodEmail && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{selectedDept.hodEmail}</span>
                    </div>
                  )}
                  {selectedDept.hodPhone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{selectedDept.hodPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Department Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-blue-600" size={20} />
                  <span className="text-sm text-gray-600">Students</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{selectedDept.students}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="text-green-600" size={20} />
                  <span className="text-sm text-gray-600">Faculty</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{selectedDept.faculty}</p>
              </div>
            </div>

            {/* Sections */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="text-blue-600" size={24} />
                Sections Overview
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.keys(selectedDept.sections).map((section) => (
                  <div
                    key={section}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                  >
                    <h4 className="text-lg font-bold text-blue-700 mb-4 pb-2 border-b border-blue-200">
                      {section} Section
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Users className="text-blue-600" size={16} />
                          Students ({selectedDept.sections[section].students.length})
                        </h5>
                        <ul className="space-y-1">
                          {selectedDept.sections[section].students.map(
                            (student, i) => (
                              <li key={i} className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-md">
                                {student}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <UserCheck className="text-green-600" size={16} />
                          Faculty ({selectedDept.sections[section].faculty.length})
                        </h5>
                        <ul className="space-y-1">
                          {selectedDept.sections[section].faculty.map(
                            (fac, i) => (
                              <li key={i} className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-md">
                                {fac}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 md:p-6 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setEditing(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl">
                  <Edit3 className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Department
                </h2>
              </div>
              <p className="text-gray-600 text-sm">Update department information</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Head of Department
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={editing.hod}
                  onChange={(e) => setEditing({ ...editing, hod: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Students
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={editing.students}
                    onChange={(e) =>
                      setEditing({ ...editing, students: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Faculty Members
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={editing.faculty}
                    onChange={(e) =>
                      setEditing({ ...editing, faculty: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              {editing.courses !== undefined && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Courses
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={editing.courses}
                    onChange={(e) =>
                      setEditing({ ...editing, courses: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setEditing(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
