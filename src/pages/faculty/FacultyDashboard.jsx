import { useState } from "react";
import {
  Menu, X, Users, BookOpen, ClipboardList,
  Megaphone, LogOut, Home
} from "lucide-react";

import Courses from "./Courses";
import AiQuizAssignmentForm from "./AiQuizAssignmentForm";
import FacultyAnnouncements from "./FacultyAnnouncements";

const sidebarLinks = [
  { name: "Dashboard", icon: <Home size={18} /> },
  { name: "My Courses", icon: <BookOpen size={18} /> },
  { name: "Assignments & Quiz", icon: <ClipboardList size={18} /> },
  { name: "Announcements", icon: <Megaphone size={18} /> },
];

export default function FacultyDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="p-6 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Professor</span>
                </h1>
                <p className="text-gray-500 mt-1">Here's your academic overview</p>
              </div>
              <button
                onClick={() => (window.location.href = "/login/faculty")}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md transition hover:shadow-lg"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl shadow-md border bg-gradient-to-br from-indigo-100 via-indigo-50 to-white hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-lg shadow text-indigo-600">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Courses</p>
                    <h3 className="text-2xl font-bold text-gray-800">2</h3>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl shadow-md border bg-gradient-to-br from-blue-100 via-blue-50 to-white hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-lg shadow text-blue-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Students</p>
                    <h3 className="text-2xl font-bold text-gray-800">10</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {sidebarLinks.slice(1).map((link, index) => {
                  const bgColors = [
                    "from-indigo-100 to-indigo-50",
                    "from-purple-100 to-purple-50",
                    "from-pink-100 to-pink-50",
                  ];
                  const bg = bgColors[index % bgColors.length];

                  return (
                    <button
                      key={index}
                      onClick={() => setActiveTab(link.name)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-lg border hover:shadow-md hover:-translate-y-1 transform transition bg-gradient-to-br ${bg}`}
                    >
                      <div className="bg-white p-3 rounded-full shadow text-indigo-600">
                        {link.icon}
                      </div>
                      <h3 className="font-semibold text-sm text-center text-gray-700">
                        {link.name}
                      </h3>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "My Courses":
        return <Courses />;
      case "Assignments & Quiz":
        return <AiQuizAssignmentForm />;
      case "Announcements":
        return <FacultyAnnouncements />;

      default:
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg">
                {sidebarLinks.find(link => link.name === activeTab)?.icon}
              </div>
              <h1 className="text-2xl font-bold text-indigo-700">{activeTab}</h1>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
              <p className="text-gray-600 text-center">This section is under development. Coming soon!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-black text-white w-64 py-6 px-4 fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition duration-300 ease-in-out z-50 shadow-2xl`}
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Users className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Faculty Portal</h2>
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
                  ? "bg-white text-indigo-700 shadow-md"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className={`${activeTab === link.name ? "text-indigo-600" : "text-gray-400"}`}>
                {link.icon}
              </span>
              {link.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white bg-indigo-600 p-2 rounded-lg shadow-lg hover:bg-indigo-700 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
