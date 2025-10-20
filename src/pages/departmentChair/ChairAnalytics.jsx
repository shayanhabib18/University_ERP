import { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  GraduationCap,
  Users,
  TrendingUp,
  BookOpen,
  BarChart3,
  Download,
  Share2,
  CheckCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ChairAnalytics() {
  const [view, setView] = useState("students");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState("");
  const [sharedSuccess, setSharedSuccess] = useState(false);
  const reportRef = useRef(null);

  // ======= Student Analytics Data =======
  const studentPerformanceData = [
    { course: "Marketing", avgGPA: 3.6 },
    { course: "Accounting", avgGPA: 3.2 },
    { course: "Economics", avgGPA: 2.9 },
    { course: "Finance", avgGPA: 3.8 },
    { course: "Management", avgGPA: 3.5 },
  ];

  const passFailData = [
    { name: "Passed", value: 86 },
    { name: "Failed", value: 14 },
  ];

  // ======= Faculty Analytics Data =======
  const facultyPerformanceData = [
    { name: "Dr. Sarah Khan", avgRating: 4.8 },
    { name: "Prof. Ali Raza", avgRating: 4.5 },
    { name: "Dr. Ayesha Malik", avgRating: 4.7 },
    { name: "Mr. Imran", avgRating: 4.2 },
  ];

  const researchData = [
    { name: "Published Papers", value: 65 },
    { name: "Ongoing Research", value: 35 },
  ];

  const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];

  // ======= Function to Download Report =======
  const handleDownloadPDF = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;

    const canvas = await html2canvas(reportElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.text(
      view === "students"
        ? "Student Analytics Report"
        : "Faculty Analytics Report",
      14,
      10
    );
    pdf.addImage(imgData, "PNG", 10, position + 10, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(
      view === "students"
        ? "Student_Analytics_Report.pdf"
        : "Faculty_Analytics_Report.pdf"
    );
  };

  // ======= Simulated Share Function =======
  const handleShareReport = () => {
    setSharedSuccess(true);
    setTimeout(() => {
      setShowShareModal(false);
      setSharedSuccess(false);
      setShareTarget("");
    }, 2000);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
          <BarChart3 className="text-blue-600" />
          Department Chair Analytics
        </h1>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setView("students")}
            className={`px-5 py-2 rounded-lg border text-sm font-medium shadow-sm transition-all ${
              view === "students"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Student Analytics
          </button>
          <button
            onClick={() => setView("faculty")}
            className={`px-5 py-2 rounded-lg border text-sm font-medium shadow-sm transition-all ${
              view === "faculty"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Faculty Analytics
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition"
          >
            <Download size={16} />
            Download
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>

      {/* ===== Analytics Content ===== */}
      <div ref={reportRef}>
        {view === "students" ? (
          <StudentAnalyticsView
            studentPerformanceData={studentPerformanceData}
            passFailData={passFailData}
            COLORS={COLORS}
          />
        ) : (
          <FacultyAnalyticsView
            facultyPerformanceData={facultyPerformanceData}
            researchData={researchData}
            COLORS={COLORS}
          />
        )}
      </div>

      {/* ===== Share Modal ===== */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 relative animate-fadeIn">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-5 text-center text-gray-800">
              Share Analytics Report
            </h3>

            <label className="block mb-2 text-sm font-semibold text-gray-600">
              Send To:
            </label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              value={shareTarget}
              onChange={(e) => setShareTarget(e.target.value)}
            >
              <option value="">Select recipient</option>
              <option value="executive">Executive Portal</option>
              <option value="admin">Admin Portal</option>
            </select>

            <button
              onClick={handleShareReport}
              disabled={!shareTarget}
              className={`w-full py-2.5 rounded-lg text-white font-medium transition ${
                shareTarget
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Share Report
            </button>

            {sharedSuccess && (
              <div className="mt-3 flex items-center gap-2 text-green-600 text-sm justify-center">
                <CheckCircle size={16} /> Report successfully shared to{" "}
                <strong>{shareTarget}</strong>.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Student Analytics View ================= */
function StudentAnalyticsView({ studentPerformanceData, passFailData, COLORS }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KPICard
          icon={<TrendingUp className="text-green-500" />}
          title="Average GPA"
          value="3.42"
        />
        <KPICard
          icon={<Users className="text-blue-500" />}
          title="Total Students"
          value="240"
        />
        <KPICard
          icon={<BookOpen className="text-purple-500" />}
          title="Courses Offered"
          value="25"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow col-span-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Average GPA by Course
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" />
              <YAxis domain={[0, 4]} />
              <Tooltip />
              <Bar dataKey="avgGPA" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Pass / Fail Ratio
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={passFailData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                label
              >
                {passFailData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= Faculty Analytics View ================= */
function FacultyAnalyticsView({ facultyPerformanceData, researchData, COLORS }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KPICard
          icon={<GraduationCap className="text-indigo-500" />}
          title="Average Faculty Rating"
          value="4.6 / 5"
        />
        <KPICard
          icon={<Users className="text-teal-500" />}
          title="Active Faculty"
          value="18"
        />
        <KPICard
          icon={<BookOpen className="text-rose-500" />}
          title="Research Projects"
          value="35"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow col-span-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Faculty Performance (Avg Rating)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={facultyPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="avgRating" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Research Work Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={researchData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                label
              >
                {researchData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= Reusable KPI Card ================= */
function KPICard({ icon, title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4 hover:shadow-md transition">
      <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
