import { useState } from "react";
import { FileText, Download, Eye, Building2, Users, GraduationCap } from "lucide-react";
import FacultyPerformanceReport from "./FacultyPerformanceReport";
import StudentAchievementReport from "./StudentAchievementReport";
import DepartmentAchievementReport from "./DepartmentAchievementReport";

export default function ExecutiveReports() {
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    {
      id: "faculty",
      title: "Faculty Performance Report",
      description: "Teaching efficiency and research productivity metrics",
      icon: <Users className="w-6 h-6" />,
      component: <FacultyPerformanceReport />,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "student",
      title: "Student Achievement Report",
      description: "GPA distribution and academic performance analysis",
      icon: <GraduationCap className="w-6 h-6" />,
      component: <StudentAchievementReport />,
      color: "from-green-500 to-green-600",
    },
    {
      id: "department",
      title: "Department Achievement Report",
      description: "Research, innovation, and outreach trends",
      icon: <Building2 className="w-6 h-6" />,
      component: <DepartmentAchievementReport />,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleDownload = (reportTitle) => {
    alert(`📊 Downloading ${reportTitle}...`);
    // Future: Implement actual PDF/Excel download functionality
  };

  if (selectedReport) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setSelectedReport(null)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            ← Back to Reports
          </button>
          <button
            onClick={() => handleDownload(selectedReport.title)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={18} />
            Download Report
          </button>
        </div>
        {selectedReport.component}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <FileText className="text-blue-600" size={32} />
          Executive Reports
        </h1>
        <p className="text-gray-600">
          Access comprehensive reports on faculty, student, and department performance
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className={`bg-gradient-to-br ${report.color} p-4 rounded-lg mb-4 text-white inline-block`}>
              {report.icon}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {report.title}
            </h2>
            
            <p className="text-gray-600 text-sm mb-4">
              {report.description}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleViewReport(report)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Eye size={18} />
                View Report
              </button>
              <button
                onClick={() => handleDownload(report.title)}
                className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                title="Download"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

