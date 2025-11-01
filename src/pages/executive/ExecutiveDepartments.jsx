import { useState } from "react";
import {
  Building2,
  Users,
  UserCheck,
  Eye,
  Edit3,
  UserPlus,
  X,
} from "lucide-react";

export default function DepartmentOverview() {
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "Computer Science",
      hod: "Dr. Ahmed Raza",
      students: 320,
      faculty: 22,
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
      students: 270,
      faculty: 18,
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
  ]);

  const [selectedDept, setSelectedDept] = useState(null);
  const [editing, setEditing] = useState(null);
  const [newHod, setNewHod] = useState("");

  // ✅ Assign/Change HOD
  const handleAssignHod = (id) => {
    if (!newHod.trim()) {
      alert("Please enter a name for the new HOD.");
      return;
    }

    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === id ? { ...dept, hod: newHod } : dept
      )
    );
    setNewHod("");
    alert("HOD updated successfully!");
  };

  // ✅ Save Edited Department
  const handleSaveEdit = () => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === editing.id ? editing : d))
    );
    setEditing(null);
    alert("Department details updated!");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 flex items-center">
        <Building2 className="mr-3" /> Department Overview
      </h1>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {dept.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Head:{" "}
              <span className="font-medium text-gray-700">{dept.hod}</span>
            </p>

            <div className="flex justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="text-blue-600" />
                <span className="text-gray-700 font-medium">
                  {dept.students} Students
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <UserCheck className="text-green-600" />
                <span className="text-gray-700 font-medium">
                  {dept.faculty} Faculty
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setSelectedDept(dept)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                <Eye size={16} className="inline mr-1" /> View
              </button>
              <button
                onClick={() => setEditing({ ...dept })}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                <Edit3 size={16} className="inline mr-1" /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODAL */}
      {selectedDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedDept(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold mb-2 text-blue-700 flex items-center">
              <Building2 className="mr-2" /> {selectedDept.name}
            </h2>
            <p className="text-gray-600 mb-4">Head: {selectedDept.hod}</p>

            {/* Sections */}
            <div className="border-t pt-3">
              <h3 className="text-lg font-semibold mb-2">Sections Overview</h3>
              {Object.keys(selectedDept.sections).map((section) => (
                <div
                  key={section}
                  className="mb-4 bg-gray-50 p-4 rounded-lg border"
                >
                  <h4 className="text-md font-semibold text-blue-700 mb-2">
                    {section} Section
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">
                        Students:
                      </h5>
                      <ul className="list-disc ml-5 text-gray-600 text-sm">
                        {selectedDept.sections[section].students.map(
                          (student, i) => (
                            <li key={i}>{student}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">
                        Faculty:
                      </h5>
                      <ul className="list-disc ml-5 text-gray-600 text-sm">
                        {selectedDept.sections[section].faculty.map(
                          (fac, i) => (
                            <li key={i}>{fac}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Assign HOD */}
            <div className="mt-4 border-t pt-3">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <UserPlus className="mr-2 text-green-600" /> Assign / Change HOD
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new HOD name"
                  value={newHod}
                  onChange={(e) => setNewHod(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button
                  onClick={() => handleAssignHod(selectedDept.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setEditing(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <X size={22} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-yellow-600">
              Edit Department
            </h2>

            <input
              type="text"
              className="border p-2 rounded w-full mb-3"
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />
            <input
              type="text"
              className="border p-2 rounded w-full mb-3"
              value={editing.hod}
              onChange={(e) => setEditing({ ...editing, hod: e.target.value })}
            />
            <input
              type="number"
              className="border p-2 rounded w-full mb-3"
              value={editing.students}
              onChange={(e) =>
                setEditing({ ...editing, students: e.target.value })
              }
            />
            <input
              type="number"
              className="border p-2 rounded w-full mb-3"
              value={editing.faculty}
              onChange={(e) =>
                setEditing({ ...editing, faculty: e.target.value })
              }
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditing(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
