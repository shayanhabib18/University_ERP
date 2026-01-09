import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  LogOut,
  Home,
  BarChart2,
  Clock,
  CheckCircle,
  UserCog,
  BookMarked,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DepartmentManagement from "./DepartmentManagement";
import FacultyManagement from "./FacultyManagement";
import FacultyRoleManagement from "./FacultyRoleManagement";
import StudentManagement from "./StudentManagement";
import HandleRequests from "./HandleRequests";
import AdminAnnouncements from "./AdminAnnouncement";
import { departmentAPI, courseAPI, facultyAPI, studentAPI } from "../../services/api";

const sidebarLinks = [
  "Overview",
  "Add Departments & Courses",
  "Faculty Management",
  "Faculty Role Management",
  "Student Management",
  "Requests",
  "Announcements",
];

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [counts, setCounts] = useState({ students: 0, faculties: 0, courses: 0, departments: 0 });
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCounts = async () => {
      try {
        setLoadingCounts(true);
        const [students, faculties, courses, departments] = await Promise.all([
          studentAPI.getAll(),
          facultyAPI.getAll(),
          courseAPI.getAll(),
          departmentAPI.getAll(),
        ]);
        setCounts({
          students: Array.isArray(students) ? students.length : 0,
          faculties: Array.isArray(faculties) ? faculties.length : 0,
          courses: Array.isArray(courses) ? courses.length : 0,
          departments: Array.isArray(departments) ? departments.length : 0,
        });
      } catch (err) {
        console.error("Failed to load overview counts", err);
      } finally {
        setLoadingCounts(false);
      }
    };

    const loadPendingRequests = async () => {
      try {
        setLoadingRequests(true);
        const response = await fetch("http://localhost:5000/students/signup-requests");
        if (response.ok) {
          const data = await response.json();
          // Filter only pending requests and take latest 3
          const pending = data.filter(req => req.status === "pending").slice(0, 3);
          setPendingRequests(pending);
        }
      } catch (err) {
        console.error("Failed to load pending requests", err);
      } finally {
        setLoadingRequests(false);
      }
    };

    loadCounts();
    loadPendingRequests();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard{" "}
                  <span className="text-indigo-600">Overview</span>
                </h1>
                <p className="text-gray-500 mt-1">
                  Welcome back! Here's your system summary
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Users className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Total Students
                    </h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {loadingCounts ? "..." : counts.students}
                    </p>
                    <p className="text-xs text-indigo-600 mt-2">
                      {loadingCounts ? "" : "Live total from records"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <UserCog className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Total Faculty
                    </h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {loadingCounts ? "..." : counts.faculties}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">{loadingCounts ? "" : "Live total from records"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <BookMarked className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Courses
                    </h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {loadingCounts ? "..." : counts.courses}
                    </p>
                    <p className="text-xs text-emerald-600 mt-2">
                      {loadingCounts ? "" : "Live total from records"}
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
                onClick={() => setActiveTab("Requests")}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Clock className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Requests
                    </h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {loadingRequests ? "..." : pendingRequests.length}
                    </p>
                    <p className="text-xs text-orange-600 mt-2">
                      {loadingRequests ? "" : "Awaiting approval"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Analytics Placeholder */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart2 className="text-indigo-600" size={20} />
                    System Analytics
                  </h2>
                  <select className="text-sm border rounded px-2 py-1">
                    <option>Last 30 days</option>
                    <option>This Semester</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="h-60 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-dashed">
                  [Interactive Chart Placeholder]
                </div>
              </div>

              {/* Incoming Requests Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <ClipboardList className="text-indigo-600" size={20} />
                    Requests
                  </h2>
                  <button
                    onClick={() => setActiveTab("Requests")}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {loadingRequests ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading requests...
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="mx-auto mb-2 text-gray-300" size={40} />
                    <p className="text-sm">No pending requests</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {pendingRequests.map((req) => {
                      const timeAgo = new Date(req.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      const percentage = ((req.obtained_marks / req.total_marks) * 100).toFixed(1);
                      
                      return (
                        <li
                          key={req.id}
                          className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer border border-gray-100"
                          onClick={() => setActiveTab("Requests")}
                        >
                          <div className="bg-indigo-100 p-2 rounded-full mt-1">
                            <Users className="text-indigo-600" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{req.student_name}</p>
                            <p className="text-sm text-gray-600">
                              {req.departments?.name || 'Department N/A'} • {percentage}%
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {timeAgo}
                            </p>
                          </div>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            Pending
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );

      case "Add Departments & Courses":
        return <DepartmentManagement />;

      case "Faculty Management":
        return <FacultyManagement />;

      case "Faculty Role Management":
        return <FacultyRoleManagement />;

      case "Student Management":
        return <StudentManagement />;

      case "Requests":
        return <HandleRequests />;

      case "Announcements":
        return <AdminAnnouncements />;

      default:
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Home className="text-indigo-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-indigo-700">
                {activeTab}
              </h1>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
              <p className="text-gray-600 text-center">
                Content is being prepared
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-slate-900 text-white w-64 py-7 px-2 fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 shadow-xl`}
      >
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
          Admin Panel
        </h2>
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <button
              key={link}
              onClick={() => {
                setActiveTab(link);
                setMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === link
                  ? "bg-indigo-700 font-semibold text-white"
                  : "hover:bg-indigo-600"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white bg-indigo-600 hover:bg-indigo-700 p-2 rounded shadow"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main content area */}
      <main className="flex-1 ml-0 md:ml-64 p-6">{renderContent()}</main>
    </div>
  );
}
