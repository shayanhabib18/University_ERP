import { useState } from "react";
import CoordinatorSearch from "./CoordinatorSearch";
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
} from "lucide-react";

export default function CoordinatorDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Sidebar links with 4 tabs
  const sidebarLinks = [
    { name: "Dashboard", icon: <Home size={18} /> },
    { name: "Search", icon: <BarChart3 size={18} /> },
    { name: "Feedback", icon: <Megaphone size={18} /> },
    { name: "Announcements", icon: <FileText size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent />;
      case "Search":
        return < CoordinatorSearch />;
      case "Feedback":
        return <Placeholder title="Faculty Feedback" />;
      case "Announcements":
        return <Placeholder title="Announcements" />;
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
          <div className="bg-orange-600 p-2 rounded-lg shadow-md">
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
                  ? "bg-white text-orange-700 shadow-lg"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span
                className={`${
                  activeTab === link.name ? "text-orange-600" : "text-gray-400"
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
          className="text-white bg-orange-600 p-2 rounded-lg shadow-lg hover:bg-orange-700 transition"
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
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Coordinator
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Overview of university data & department.
          </p>
        </div>
        <button
          onClick={() => (window.location.href = "/login/coordinator")}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Students" value="1,247" icon={<Users size={26} />} color="from-blue-500 to-indigo-500" />
        <StatCard title="Total Courses" value="85" icon={<BookOpen size={26} />} color="from-green-500 to-emerald-500" />
        <StatCard title="Pending Feedback" value="12" icon={<Megaphone size={26} />} color="from-yellow-500 to-orange-500" />
        <StatCard title="Announcements" value="5" icon={<FileText size={26} />} color="from-purple-500 to-pink-500" />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

/* ======================= Helper Components ======================= */
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`p-6 rounded-2xl shadow-md text-white bg-gradient-to-br ${color} hover:shadow-lg hover:scale-[1.02] transition-all`}>
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-full">{icon}</div>
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { label: "Search Records", icon: <BarChart3 size={18} />, color: "bg-blue-500" },
    { label: "Review Feedback", icon: <Megaphone size={18} />, color: "bg-purple-500" },
    { label: "Post Announcement", icon: <FileText size={18} />, color: "bg-yellow-500" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className={`${action.color} p-3 rounded-full text-white`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
      <h1 className="text-2xl font-extrabold text-orange-700 mb-4">{title}</h1>
      <div className="bg-orange-50 p-8 rounded-xl border border-orange-100 text-center text-gray-600 text-sm md:text-base">
        This section is under development. Coming soon!
      </div>
    </div>
  );
}
