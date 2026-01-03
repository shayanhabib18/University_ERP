import React, { useEffect, useMemo, useState } from "react";
import { facultyAPI, departmentAPI } from "../../services/api";

const roleOptions = [
  { value: "ALL", label: "Role: All" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "DEPT_CHAIR", label: "Department Chair" },
  { value: "COORDINATOR", label: "Coordinator" },
  { value: "FACULTY", label: "Faculty" },
];

const FacultyRoleManagement = () => {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [assigning, setAssigning] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [facultyRes, deptRes] = await Promise.all([
          facultyAPI.getAll(),
          departmentAPI.getAll(),
        ]);
        setFaculties(facultyRes || []);
        setDepartments(deptRes || []);
      } catch (err) {
        setError("Failed to load faculty data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const departmentById = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [departments]);

  const filteredFaculties = useMemo(() => {
    return faculties
      .filter((f) => {
        const matchesSearch = `${f.name || ""} ${f.email || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesRole =
          roleFilter === "ALL" || (f.role || "").toUpperCase() === roleFilter;
        const matchesDept =
          deptFilter === "ALL" || `${f.department_id}` === `${deptFilter}`;
        return matchesSearch && matchesRole && matchesDept;
      })
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [faculties, search, roleFilter, deptFilter]);

  const handleAssignExecutive = async (facultyId) => {
    setStatusMessage("");
    setAssigning((prev) => ({ ...prev, [facultyId]: true }));
    try {
      // TODO: Replace with real API call to assign executive role
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatusMessage("Executive role assigned. (Hook up real API.)");
    } catch (err) {
      setError("Failed to assign role. Please try again.");
    } finally {
      setAssigning((prev) => ({ ...prev, [facultyId]: false }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Faculty Role Management</h2>
        {statusMessage && <div className="text-sm text-green-700">{statusMessage}</div>}
      </div>

      <div className="bg-white shadow rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-1/2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search faculty by name or email"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Department: All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  Loading faculty...
                </td>
              </tr>
            )}
            {!loading && filteredFaculties.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  No faculty match the current filters.
                </td>
              </tr>
            )}
            {!loading &&
              filteredFaculties.map((f, idx) => (
                <tr key={f.id}>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-gray-700"
                    title={f.id}
                  >
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{f.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{f.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{f.role || "Unassigned"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {departmentById[f.department_id] || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleAssignExecutive(f.id)}
                      disabled={assigning[f.id]}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-60"
                    >
                      {assigning[f.id] ? "Assigning..." : "Assign Executive"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
    </div>
  );
};

export default FacultyRoleManagement;
