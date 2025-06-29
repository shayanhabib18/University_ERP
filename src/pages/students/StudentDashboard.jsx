import { useState } from "react";
import { Menu, X, Bell, BookOpen, ClipboardList, FileText, Mail, User, LogOut, Home, BarChart2, Clock, CheckCircle } from "lucide-react";
import Courses from "./Courses";
import Notifications from "./Notifications";
import AssignmentsQuizzes from "./AssignmentsQuizzes";
// import Transcript from "./Transcripts";
import Profile from "./Profile";
import Requests from "./Requests";

const sidebarLinks = [
  { name: "Dashboard Overview", icon: <Home size={18} /> },
  { name: "My Profile", icon: <User size={18} /> },
  { name: "Assignments & Quizzes", icon: <ClipboardList size={18} /> },
  { name: "Courses / Enrollments", icon: <BookOpen size={18} /> },
  // { name: "Generate Transcript", icon: <FileText size={18} /> },
  { name: "Requests / Messages", icon: <Mail size={18} /> },
  { name: "Notifications", icon: <Bell size={18} /> }
];

export default function StudentDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard Overview");
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard Overview":
        return (
          <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Welcome back, <span className="text-gradient bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Student</span>
                </h1>
                <p className="text-gray-500 mt-1">Here's your academic summary</p>
              </div>
              <button
                onClick={() => (window.location.href = "/login/student")}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Attendance Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CheckCircle className="text-blue-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">Attendance</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">92%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">+2% from last month</p>
              </div>

              {/* CGPA Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <BarChart2 className="text-indigo-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">CGPA</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">3.8</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 mr-2">Current:</span>
                  <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">3.9 GPA</span>
                </div>
              </div>

              {/* Courses Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <BookOpen className="text-emerald-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">Active Courses</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">5</p>
                <p className="text-sm text-gray-500 mt-1">3 core, 2 electives</p>
              </div>

              {/* Notifications Card */}
              <div 
                className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setActiveTab("Notifications")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Bell className="text-amber-600" size={20} />
                    </div>
                    <h3 className="text-gray-500 font-medium">Notifications</h3>
                  </div>
                  {unreadNotifications > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <Bell size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New assignment posted</p>
                      <p className="text-xs text-gray-500">CS 2406 - Information Security</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <Bell size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Grade updated</p>
                      <p className="text-xs text-gray-500">MS 3801 - Entrepreneurship</p>
                    </div>
                  </div>
                </div>
                {unreadNotifications > 2 && (
                  <p className="text-blue-600 text-sm mt-3 text-right">+{unreadNotifications - 2} more</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sidebarLinks
                  .filter(link => link.name !== "Dashboard Overview" && link.name !== "Notifications")
                  .map((link, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(link.name)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                    >
                      <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        {link.icon}
                      </div>
                      <h3 className="font-medium text-sm text-center">{link.name}</h3>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );
      case "My Profile":
        return <Profile />;
      case "Courses / Enrollments":
        return <Courses />;
      // case "Generate Transcript":
      //   return <Transcript />;
      case "Assignments & Quizzes":
        return <AssignmentsQuizzes />;
      case "Requests / Messages":
        return <Requests />;
      case "Notifications":
        return <Notifications setUnreadNotifications={setUnreadNotifications} />;
      default:
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                {sidebarLinks.find(link => link.name === activeTab)?.icon}
              </div>
              <h1 className="text-2xl font-bold text-blue-700">{activeTab}</h1>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <p className="text-gray-600 text-center">Content will be available soon</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-gray-900 to-black text-white w-64 py-7 px-4 fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 shadow-2xl`}
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg">
            <User className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Student Portal</h2>
        </div>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setActiveTab(link.name);
                setMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === link.name 
                  ? "bg-white text-blue-700 shadow-md" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className={`${activeTab === link.name ? "text-blue-600" : "text-gray-400"}`}>
                {link.icon}
              </span>
              {link.name}
              {link.name === "Notifications" && unreadNotifications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg shadow-lg transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}