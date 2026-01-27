import { useState } from "react";
import { FileText, Download, GraduationCap } from "lucide-react";
import StudentAchievementReport from "./StudentAchievementReport";

export default function ExecutiveReports() {
  const [showReport, setShowReport] = useState(false);

  const report = {
    id: "student",
    title: "Student Achievement Report",
    description: "GPA distribution and academic performance analysis",
    icon: <GraduationCap className="w-6 h-6" />,
    component: <StudentAchievementReport />,
    color: "from-green-500 to-green-600",
  };

  const handleDownload = (reportTitle) => {
    alert(`📊 Downloading ${reportTitle}...`);
    // Future: Implement actual PDF/Excel download functionality
  };

  if (showReport) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setShowReport(false)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            ← Back to Reports
          </button>
          <button
            onClick={() => handleDownload(report.title)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={18} />
            Download Report
          </button>
        </div>
        {report.component}
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
          Student Achievement Report - Academic performance analysis
        </p>
      </div>

      {/* Single Report Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300" style={{ transform: 'scale(1)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <div className={`bg-gradient-to-br ${report.color} p-4 rounded-lg mb-4 text-white inline-block`}>
            {report.icon}
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {report.title}
          </h2>
          
          <p className="text-gray-600 text-base mb-6">
            {report.description}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowReport(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              <GraduationCap size={18} />
              View Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

