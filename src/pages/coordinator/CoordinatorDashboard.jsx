import { useState } from "react";
import CoordinatorSearch from "./CoordinatorSearch";
import CoordinatorFeedback from "./CoordinatorFeedback";
import CoordinatorAnnouncements from "./CoordinatorAnnouncements";
import CoordinatorRequests from "./CoordinatorRequests";
import {
  Menu,
  X,
  Users,
  BookOpen,
  BarChart3,
  Megaphone,
  FileText,
  LogOut,
  Home,
  Send,
} from "lucide-react";

export default function CoordinatorDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Sidebar links with 5 tabs
  const sidebarLinks = [
    { name: "Dashboard", icon: <Home size={18} /> },
    { name: "Search", icon: <BarChart3 size={18} /> },
    { name: "Feedback", icon: <Megaphone size={18} /> },
    { name: "Announcements", icon: <FileText size={18} /> },
    { name: "Requests", icon: <Send size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent />;
      case "Search":
        return < CoordinatorSearch />;
      case "Feedback":
        return <CoordinatorFeedback />;
      case "Announcements":
        return <CoordinatorAnnouncements />;
      case "Requests":
        return <CoordinatorRequests />;
      default:
        return <Placeholder title={activeTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white w-64 py-6 px-4 fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition duration-300 ease-in-out z-50 shadow-2xl`}
      >
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg shadow-md">
            <Users className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-wide">Coordinator Portal</h2>
        </div>

        <nav className="space-y-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setActiveTab(link.name);
                setMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all ${
                activeTab === link.name
                  ? "bg-white text-blue-700 shadow-lg"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span
                className={`${
                  activeTab === link.name ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {link.icon}
              </span>
              {link.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white bg-blue-600 p-2 rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 overflow-auto transition-all">
        {renderContent()}
      </main>
    </div>
  );
}

/* ======================= Dashboard Content ======================= */
function DashboardContent() {
  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Coordinator
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Overview of university data & department.
          </p>
        </div>
        <button
          onClick={() => (window.location.href = "/login/coordinator")}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Students" value="1,247" icon={<Users size={26} />} color="bg-gradient-to-br from-blue-600 to-blue-400" bgLight="bg-blue-50" borderColor="border-blue-200" />
        <StatCard title="Total Courses" value="85" icon={<BookOpen size={26} />} color="bg-gradient-to-br from-cyan-600 to-cyan-400" bgLight="bg-cyan-50" borderColor="border-cyan-200" />
        <StatCard title="Pending Feedback" value="12" icon={<Megaphone size={26} />} color="bg-gradient-to-br from-indigo-600 to-indigo-400" bgLight="bg-indigo-50" borderColor="border-indigo-200" />
        <StatCard title="Announcements" value="5" icon={<FileText size={26} />} color="bg-gradient-to-br from-sky-600 to-sky-400" bgLight="bg-sky-50" borderColor="border-sky-200" />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

/* ======================= Helper Components ======================= */
function StatCard({ title, value, icon, color, bgLight, borderColor }) {
  return (
    <div className={`relative p-6 rounded-2xl shadow-lg border-2 ${borderColor} text-white ${color} overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:bg-white/30 transition-all">
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">{title}</p>
            <h3 className="text-4xl font-bold mt-1">{value}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: "Search Records", icon: <BarChart3 size={20} />, color: "bg-gradient-to-br from-blue-600 to-blue-500", bgLight: "bg-blue-50", textColor: "text-blue-700" },
    { label: "Review Feedback", icon: <Megaphone size={20} />, color: "bg-gradient-to-br from-indigo-600 to-indigo-500", bgLight: "bg-indigo-50", textColor: "text-indigo-700" },
    { label: "Post Announcement", icon: <FileText size={20} />, color: "bg-gradient-to-br from-cyan-600 to-cyan-500", bgLight: "bg-cyan-50", textColor: "text-cyan-700" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`relative flex flex-col items-center gap-3 p-6 ${action.bgLight} border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden`}
          >
            {/* Hover background effect */}
            <div className={`absolute inset-0 ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <div className="relative z-10">
              <div className={`${action.color} p-4 rounded-full text-white shadow-md group-hover:shadow-lg transition-all group-hover:scale-110`}>
                {action.icon}
              </div>
              <span className={`text-sm font-bold ${action.textColor} mt-3 block group-hover:text-gray-900 transition-colors`}>{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
      <h1 className="text-2xl font-extrabold text-blue-700 mb-4">{title}</h1>
      <div className="bg-blue-50 p-8 rounded-xl border border-blue-100 text-center text-gray-600 text-sm md:text-base">
        This section is under development. Coming soon!
      </div>
    </div>
  );
}
