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
  CalendarDays,
} from "lucide-react";

import Courses from "./Courses";
import AiQuizAssignmentForm from "./AiQuizAssignmentForm";
import FacultyAnnouncements from "./FacultyAnnouncements";
import FacultyProfile from "./FacultyProfile";
import FacultyRequests from "./FacultyRequests";

/* -------------------------------
   Sidebar Links
--------------------------------*/
const sidebarLinks = [
  { name: "Dashboard", icon: <Home size={18} /> },
  { name: "My Courses", icon: <BookOpen size={18} /> },
  { name: "Assignments & Quiz", icon: <ClipboardList size={18} /> },
  { name: "Announcements", icon: <Megaphone size={18} /> },
  { name: "Requests", icon: <ClipboardList size={18} /> },
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
      case "Requests":
        return <FacultyRequests />;
      case "Profile":
        return <FacultyProfile />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-200 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition duration-300 z-50`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <Users className="text-indigo-500" />
          <h2 className="text-lg font-semibold">Faculty Portal</h2>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setActiveTab(link.name);
                setMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-md text-sm transition ${
                activeTab === link.name
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              {link.icon}
              {link.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-md"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6">{renderContent()}</main>
    </div>
  );
}

/* -------------------------------
   Dashboard Content
--------------------------------*/
function DashboardContent({ setActiveTab }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Welcome back, <span className="text-indigo-600">Professor</span>
          </h1>
          <p className="text-sm text-slate-500">
            Academic overview for this week
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/login/faculty")}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Courses Assigned" value="4" icon={<BookOpen />} />
        <StatCard title="Active Students" value="112" icon={<Users />} />
      </div>

      {/* Upcoming + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <CalendarDays size={16} className="text-indigo-600" />
            Upcoming Classes
          </h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex justify-between">
              <span>Data Structures</span>
              <span className="text-slate-400">10:00 AM · A1</span>
            </li>
            <li className="flex justify-between">
              <span>Operating Systems</span>
              <span className="text-slate-400">1:30 PM · B4</span>
            </li>
            <li className="flex justify-between">
              <span>AI & ML</span>
              <span className="text-slate-400">3:00 PM · Lab C2</span>
            </li>
          </ul>
        </div>

        {/* Announcements */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Recent Announcements
            </h2>
            <button
              onClick={() => setActiveTab("Announcements")}
              className="text-xs text-indigo-600 hover:underline"
            >
              View All
            </button>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              Midterm exam postponed
              <div className="text-xs text-slate-400">2 hours ago</div>
            </li>
            <li>
              Assignment 3 deadline updated
              <div className="text-xs text-slate-400">Yesterday</div>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction label="My Courses" onClick={() => setActiveTab("My Courses")} icon={<BookOpen />} />
          <QuickAction label="Assignments" onClick={() => setActiveTab("Assignments & Quiz")} icon={<ClipboardList />} />
          <QuickAction label="Announcements" onClick={() => setActiveTab("Announcements")} icon={<Megaphone />} />
          <QuickAction label="Profile" onClick={() => setActiveTab("Profile")} icon={<User />} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------
   Reusable Components
--------------------------------*/
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white border rounded-lg p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <h3 className="text-2xl font-semibold text-slate-800">{value}</h3>
      </div>
      <div className="text-indigo-600">{icon}</div>
    </div>
  );
}

function QuickAction({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="border rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-indigo-50 transition"
    >
      <div className="text-indigo-600">{icon}</div>
      <span className="text-sm text-slate-700 font-medium">{label}</span>
    </button>
  );
}
