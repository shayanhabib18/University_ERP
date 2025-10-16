import { useState } from "react";
import {
  Menu,
  X,
  Users,
  BookOpen,
  ClipboardList,
  Megaphone,
  LogOut,
  Home,
  User,
  BarChart3,
  CalendarDays,
  MessageSquare,
} from "lucide-react";

import Courses from "./Courses";
import AiQuizAssignmentForm from "./AiQuizAssignmentForm";
import FacultyAnnouncements from "./FacultyAnnouncements";
import FacultyProfile from "./FacultyProfile";

// Sidebar navigation links
const sidebarLinks = [
  { name: "Dashboard", icon: <Home size={18} /> },
  { name: "My Courses", icon: <BookOpen size={18} /> },
  { name: "Assignments & Quiz", icon: <ClipboardList size={18} /> },
  { name: "Announcements", icon: <Megaphone size={18} /> },
  { name: "Profile", icon: <User size={18} /> },
];

export default function FacultyDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent setActiveTab={setActiveTab} />;
      case "My Courses":
        return <Courses />;
      case "Assignments & Quiz":
        return <AiQuizAssignmentForm />;
      case "Announcements":
        return <FacultyAnnouncements />;
      case "Profile":
        return <FacultyProfile />;
      default:
        return (
          <div className="p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h1 className="text-2xl font-bold text-indigo-700">{activeTab}</h1>
              <p className="text-gray-600 mt-4 text-center">
                This section is under development. Coming soon!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Sidebar */}
      <aside
        className={`bg-black text-white w-64 py-6 px-4 fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition duration-300 ease-in-out z-50 shadow-2xl`}
      >
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
            <Users className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Faculty Portal
          </h2>
        </div>

        <nav className="space-y-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setActiveTab(link.name);
                setMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === link.name
                  ? "bg-white text-indigo-700 shadow-md"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span
                className={`${
                  activeTab === link.name ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {link.icon}
              </span>
              <span className="font-medium">{link.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu */}
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

/* -------------------------------
   Dashboard Page Component
--------------------------------*/
function DashboardContent({ setActiveTab }) {
  return (
    <div className="p-6 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Professor
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            Here’s what’s happening in your courses this week.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/login/faculty")}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl shadow-md transition hover:shadow-lg"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen size={24} />}
          title="Courses Assigned"
          value="4"
          gradient="from-indigo-500 to-blue-500"
        />
        <StatCard
          icon={<Users size={24} />}
          title="Active Students"
          value="112"
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Upcoming Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-white border shadow-sm p-6 rounded-2xl hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays size={18} className="text-indigo-600" />
              Upcoming Classes
            </h2>
            <button className="text-sm text-indigo-600 hover:underline">
              View All
            </button>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex justify-between items-center border-b pb-2">
              <span>Data Structures — 10:00 AM</span>
              <span className="text-sm text-gray-400">Room A1</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span>Operating Systems — 1:30 PM</span>
              <span className="text-sm text-gray-400">Room B4</span>
            </li>
            <li className="flex justify-between items-center">
              <span>AI & Machine Learning — 3:00 PM</span>
              <span className="text-sm text-gray-400">Lab C2</span>
            </li>
          </ul>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white border shadow-sm p-6 rounded-2xl hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Megaphone size={18} className="text-purple-600" />
              Recent Announcements
            </h2>
            <button
              onClick={() => setActiveTab("Announcements")}
              className="text-sm text-purple-600 hover:underline"
            >
              View All
            </button>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="border-b pb-2">
              <p className="font-medium">Midterm exam postponed to Monday</p>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </li>
            <li className="border-b pb-2">
              <p className="font-medium">
                Submit Assignment 3 by next Thursday
              </p>
              <span className="text-xs text-gray-400">Yesterday</span>
            </li>
            <li>
              <p className="font-medium">AI Quiz available now in portal</p>
              <span className="text-xs text-gray-400">3 days ago</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border shadow-sm p-6 rounded-2xl mt-8 hover:shadow-lg transition">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <QuickAction
            icon={<BookOpen size={22} />}
            label="My Courses"
            onClick={() => setActiveTab("My Courses")}
            gradient="from-indigo-500 to-blue-500"
          />
          <QuickAction
            icon={<ClipboardList size={22} />}
            label="Assignments & Quiz"
            onClick={() => setActiveTab("Assignments & Quiz")}
            gradient="from-purple-500 to-pink-500"
          />
          <QuickAction
            icon={<Megaphone size={22} />}
            label="Announcements"
            onClick={() => setActiveTab("Announcements")}
            gradient="from-green-500 to-emerald-500"
          />
          {/* ✅ Fixed Profile Quick Action */}
          <QuickAction
            icon={<User size={22} />}
            label="Profile"
            onClick={() => setActiveTab("Profile")}
            gradient="from-amber-500 to-orange-500"
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------
   Reusable Components
--------------------------------*/
function StatCard({ icon, title, value, gradient }) {
  return (
    <div
      className={`p-6 rounded-2xl shadow-sm border text-white bg-gradient-to-r ${gradient} transform hover:scale-[1.02] transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">{icon}</div>
        <h3 className="text-3xl font-bold drop-shadow-sm">{value}</h3>
      </div>
      <p className="mt-3 text-sm font-medium text-white/90">{title}</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick, gradient }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all`}
    >
      <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">{icon}</div>
      <span className="text-sm font-semibold tracking-wide">{label}</span>
    </button>
  );
}
