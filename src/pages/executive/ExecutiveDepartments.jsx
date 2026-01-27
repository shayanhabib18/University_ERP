import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  UserCheck,
  Eye,
  X,
  Search,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function ExecutiveDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [selectedDept, setSelectedDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch departments with statistics from backend
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("http://localhost:5000/departments/stats");
      
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      
      const data = await response.json();
      
      setDepartments(data.departments || []);
      setTotalDepartments(data.totalDepartments || 0);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError(err.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.hodName && dept.hodName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Departments</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDepartments}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          <div className="mt-4 md:mt-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
            <p className="text-sm font-medium opacity-90">Total Departments</p>
            <p className="text-3xl font-bold">{totalDepartments}</p>
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
              <p className="font-semibold text-gray-800">
                {dept.hodName || "Not Assigned"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="text-blue-600" size={16} />
                  <span className="text-xs text-gray-600">Students</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{dept.studentCount}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="text-green-600" size={16} />
                  <span className="text-xs text-gray-600">Faculty</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{dept.facultyCount}</p>
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
                <p className="text-xl font-bold text-gray-800 mb-2">
                  {selectedDept.hodName || "Not Assigned"}
                </p>
                {selectedDept.hodEmail && (
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{selectedDept.hodEmail}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-blue-600" size={20} />
                  <span className="text-sm text-gray-600">Students</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{selectedDept.studentCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="text-green-600" size={20} />
                  <span className="text-sm text-gray-600">Faculty</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{selectedDept.facultyCount}</p>
              </div>
            </div>

            {selectedDept.code && (
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-600 mb-1">Department Code</p>
                <p className="text-lg font-semibold text-gray-800">{selectedDept.code}</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
