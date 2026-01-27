import { useState, useEffect } from "react";
import { Users, ArrowRight } from "lucide-react";

// Sample departments and faculty (replace with backend later)
const departmentsData = [
  {
    id: "ams",
    name: "Allied Medical Sciences",
    short: "AMS",
    color: "bg-gradient-to-r from-orange-400 to-red-500",
    description: "Manage student records in Allied Medical Sciences",
    faculty: [
      { id: "f1", name: "Dr. Ali Khan", title: "Professor", email: "ali.khan@example.com" },
      { id: "f2", name: "Dr. Sara Ahmed", title: "Assistant Professor", email: "sara.ahmed@example.com" },
    ],
  },
  {
    id: "cs",
    name: "Computer Science",
    short: "CS",
    color: "bg-gradient-to-r from-blue-400 to-cyan-500",
    description: "Manage student records in Computer Science",
    faculty: [
      { id: "f3", name: "Dr. Omar Rizvi", title: "Associate Professor", email: "omar.rizvi@example.com" },
    ],
  },
  {
    id: "se",
    name: "Software Engineering",
    short: "SE",
    color: "bg-gradient-to-r from-purple-400 to-pink-500",
    description: "Manage student records in Software Engineering",
    faculty: [
      { id: "f4", name: "Dr. Zainab Malik", title: "Professor", email: "zainab.malik@example.com" },
    ],
  },
];

export default function CoordinatorFaculty() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    setDepartments(departmentsData);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Users size={28} className="text-blue-600" /> Faculty Management
      </h2>

      {/* Department Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all min-h-[250px]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`${dept.color} w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold text-lg`}
              >
                {dept.short}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{dept.name}</h3>
                <p className="text-gray-500 text-sm">{dept.description}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDept(selectedDept === dept.id ? null : dept.id)}
              className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
            >
              Access Department
            </button>

            {/* Faculty List */}
            {selectedDept === dept.id && (
              <div className="mt-4 space-y-3 border-t pt-4 border-gray-200">
                {dept.faculty.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{f.name}</p>
                      <p className="text-sm text-gray-500">{f.title}</p>
                      <p className="text-sm text-gray-500">{f.email}</p>
                    </div>
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      View <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
