import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BarChart3,
  Building2,
  FileText,
  Download,
  Loader2,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ExecutiveAnalytics() {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("2024–2025");

  const [stats, setStats] = useState({
    totalStudents: 12540,
    totalFaculty: 380,
    totalDepartments: 12,
    passRate: 89.4,
  });

  const departmentPerformance = [
    { name: "Computer Science", avgGPA: 3.6 },
    { name: "Business", avgGPA: 3.4 },
    { name: "Engineering", avgGPA: 3.2 },
    { name: "Mathematics", avgGPA: 3.8 },
    { name: "Arts", avgGPA: 3.5 },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleDownload = () => {
    alert("📊 Report download initiated...");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-10">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-800">
            Executive Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Visual overview of institutional and departmental performance
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Filter className="text-blue-600" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 shadow-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option>2024–2025</option>
            <option>2023–2024</option>
            <option>2022–2023</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPI icon={<GraduationCap />} label="Total Students" value={stats.totalStudents} />
        <KPI icon={<Users />} label="Total Faculty" value={stats.totalFaculty} />
        <KPI icon={<Building2 />} label="Departments" value={stats.totalDepartments} />
        <KPI icon={<BarChart3 />} label="Pass Rate" value={`${stats.passRate}%`} />
      </div>

      {/* Department Performance Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Department Average GPA
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={departmentPerformance}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 4]} />
            <Tooltip />
            <Bar dataKey="avgGPA" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Reports Summary Section */}
      <div className="bg-white rounded-2xl shadow-md p-8 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" /> Reports Overview
          </h2>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" /> Download Reports
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          The following reports summarize institutional trends for the academic
          year {selectedYear}.
        </p>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReportCard title="Faculty Performance Report" path="/executive/faculty-report" />
          <ReportCard title="Student Achievement Report" path="/executive/student-report" />
          <ReportCard title="Department Efficiency Metrics" path="/executive/department-report" />
          <ReportCard title="Research Contribution Summary" path="/executive/research-report" />
          <ReportCard title="Financial Overview" path="/executive/finance-report" />
          <ReportCard title="Examination Success Ratios" path="/executive/exam-report" />
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} University ERP System — Executive Analytics
      </div>
    </div>
  );
}

// KPI Card Component
function KPI({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex items-center gap-4">
      <div className="p-3 bg-blue-100 rounded-lg text-blue-600">{icon}</div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

// Report Card Component
function ReportCard({ title, path }) {
  return (
    <li
      onClick={() => alert(`Navigating to ${title}... (future route: ${path})`)}
      className="bg-gray-50 p-4 rounded-xl hover:bg-blue-50 border border-gray-100 transition cursor-pointer"
    >
      <h3 className="text-gray-800 font-semibold">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">View detailed insights and metrics</p>
    </li>
  );
}
