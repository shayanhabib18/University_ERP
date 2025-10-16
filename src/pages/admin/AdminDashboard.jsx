import { useState } from "react";
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
import StudentManagement from "./StudentManagement";
import HandleRequests from "./HandleRequests";
import AdminAnnouncements from "./AdminAnnouncement";

const sidebarLinks = [
  "Overview",
  "Add Departments & Courses",
  "Faculty Management",
  "Student Management",
  "Requests",
  "Announcements",
];

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const navigate = useNavigate();

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Users className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Total Students
                    </h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">512</p>
                    <p className="text-xs text-indigo-600 mt-2">
                      +12 this Semester
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
                    <p className="text-2xl font-bold text-gray-800 mt-1">45</p>
                    <p className="text-xs text-blue-600 mt-2">3 new hires</p>
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
                    <p className="text-2xl font-bold text-gray-800 mt-1">67</p>
                    <p className="text-xs text-emerald-600 mt-2">
                      5 new this semester
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
                    Incoming Requests
                  </h2>
                  <button
                    onClick={() => setActiveTab("Requests")}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <ul className="space-y-4">
                  {[
                    {
                      id: "RQT-001",
                      title: "Transcript Request",
                      description: "Requested by: Ahmed Raza",
                      time: "1 hour ago",
                    },
                    {
                      id: "RQT-002",
                      title: "Course Add/Drop",
                      description: "Requested by: Fatima Noor",
                      time: "Today at 10:00 AM",
                    },
                    {
                      id: "RQT-003",
                      title: "Semester Freeze",
                      description: "Requested by: Bilal Khan",
                      time: "Yesterday",
                    },
                  ].map((req) => (
                    <li
                      key={req.id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                      onClick={() => setActiveTab("Requests")}
                    >
                      <div className="bg-indigo-100 p-2 rounded-full mt-1">
                        <ClipboardList className="text-indigo-600" size={16} />
                      </div>
                      <div>
                        <p className="font-medium">{req.title}</p>
                        <p className="text-sm text-gray-500">
                          {req.description} • {req.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case "Add Departments & Courses":
        return <DepartmentManagement />;

      case "Faculty Management":
        return <FacultyManagement />;

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
