import React, { useState } from "react";

const roles = [
  { value: "EXECUTIVE", label: "Executive" },
  { value: "DEPT_CHAIR", label: "Department Chair" },
  { value: "COORDINATOR", label: "Coordinator" },
];

const departments = [
  { id: 1, name: "Software Engineering" },
  { id: 2, name: "Electrical Engineering" },
];

const facultyData = [
  { id: 1, name: "Dr. Ahmed", email: "ahmed@uni.edu", department_id: 1 },
  { id: 2, name: "Dr. Sara", email: "sara@uni.edu", department_id: 2 },
];

const FacultyRoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState(null);

  const isRoleAvailable = (role, deptId) => {
    if (role === "EXECUTIVE") {
      return !users.some((u) => u.role === "EXECUTIVE");
    }
    return !users.some((u) => u.role === role && u.department_id === deptId);
  };

  const assignRole = () => {
    setError("");

    if (!isRoleAvailable(selectedRole, selectedFaculty.department_id)) {
      setError("This role is already assigned.");
      return;
    }

    const username = selectedFaculty.email.split("@")[0];
    const password = Math.random().toString(36).slice(-8);

    const newUser = {
      faculty_id: selectedFaculty.id,
      role: selectedRole,
      department_id:
        selectedRole === "EXECUTIVE" ? null : selectedFaculty.department_id,
      username,
    };

    setUsers([...users, newUser]);
    setCredentials({ username, password });
    setSelectedFaculty(null);
    setSelectedRole("");
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        University Role Management
      </h2>

      {/* Faculty Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facultyData.map((f) => (
              <tr key={f.id}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                  {f.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {departments.find((d) => d.id === f.department_id)?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedFaculty(f)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Assign Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Role */}
      {selectedFaculty && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Assign Role to {selectedFaculty.name}
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            <button
              disabled={!selectedRole}
              onClick={assignRole}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              Assign & Generate Credentials
            </button>
          </div>

          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}

      {/* Credentials */}
      {credentials && (
        <div className="bg-white p-4 rounded shadow border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">Credentials</h4>
          <p>
            <span className="font-medium">Username:</span> {credentials.username}
          </p>
          <p>
            <span className="font-medium">Password:</span> {credentials.password}
          </p>
        </div>
      )}
    </div>
  );
};

export default FacultyRoleManagement;
