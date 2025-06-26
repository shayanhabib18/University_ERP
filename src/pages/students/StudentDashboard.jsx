import { useState } from "react";
import { Menu, X, Bell, BookOpen, ClipboardList, FileText, Mail, User, LogOut } from "lucide-react";
import Courses from "./Courses";
import Notifications from "./Notifications";
import AssignmentsQuizzes from "./AssignmentsQuizzes";
import Transcript from "./Transcripts";
import Profile from "./Profile";
import Requests from "./Requests";

const sidebarLinks = [
  { name: "Dashboard Overview", icon: <User size={18} /> },
  { name: "My Profile", icon: <User size={18} /> },
  { name: "Assignments & Quizzes", icon: <ClipboardList size={18} /> },
  { name: "Courses / Enrollments", icon: <BookOpen size={18} /> },
  { name: "Generate Transcript", icon: <FileText size={18} /> },
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
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Welcome back, <span className="text-blue-600">Student</span></h1>
              <button
                onClick={() => (window.location.href = "/login/student")}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 font-medium">Attendance</h3>
                </div>
                <p className="text-3xl font-bold mt-2 text-gray-800">92%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 font-medium">CGPA</h3>
                <p className="text-3xl font-bold mt-2 text-gray-800">3.8</p>
                <div className="flex items-center mt-4 space-x-2">
                  <span className="text-sm text-gray-500">Current Semester:</span>
                  <span className="text-sm font-medium text-blue-600">3.9 GPA</span>
                </div>
              </div>

              <div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTab("Notifications")}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 font-medium">Notifications</h3>
                  <div className="relative">
                    <Bell className="text-gray-400" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-1 rounded-full mr-3">
                      <Bell size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New assignment posted</p>
                      <p className="text-xs text-gray-500">CS 2406 - Information Security</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-1 rounded-full mr-3">
                      <Bell size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Grade updated</p>
                      <p className="text-xs text-gray-500">MS 3801 - Entrepreneurship</p>
                    </div>
                  </div>
                </div>
                {unreadNotifications > 2 && (
                  <p className="text-blue-600 text-sm mt-3">+{unreadNotifications - 2} more</p>
                )}
              </div>
            </div>

            {/* Quick Links - Notification section removed */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sidebarLinks
                  .filter(link => link.name !== "Notifications")
                  .slice(1)
                  .map((link, index) => (
                    <div 
                      key={index} 
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center"
                      onClick={() => setActiveTab(link.name)}
                    >
                      <div className="bg-blue-100 p-3 rounded-full inline-flex">
                        {link.icon}
                      </div>
                      <h3 className="font-medium mt-2">{link.name}</h3>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );
      case "My Profile":
        return <Profile />;
      case "Courses / Enrollments":
        return <Courses />;
      case "Generate Transcript":
        return <Transcript />;
      case "Assignments & Quizzes":
        return <AssignmentsQuizzes />;
      case "Requests / Messages":
        return <Requests />;
      case "Notifications":
        return <Notifications setUnreadNotifications={setUnreadNotifications} />;
      default:
        return (
          <div className="bg-white p-6 rounded-xl shadow">
            <h1 className="text-2xl font-bold mb-4 text-blue-700">{activeTab}</h1>
            <p className="text-gray-600">No content available for this section.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`bg-black text-white w-64 py-7 px-4 fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 shadow-xl`}
      >
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-6">🎓 Student Panel</h2>
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setActiveTab(link.name);
                setMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === link.name
                  ? "bg-blue-600 font-semibold text-white"
                  : "hover:bg-gray-800"
              }`}
            >
              {link.icon}
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
          className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded shadow"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-6">{renderContent()}</main>
    </div>
  );
}