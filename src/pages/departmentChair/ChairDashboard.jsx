import { useState } from "react";
import FacultyManagement from "./FacultyManagement";
import ChairApprovals from "./ChairApprovals";
import ChairAnalytics from "./ChairAnalytics";
import ChairTranscripts from "./ChairTranscripts";
import ChairAnnouncements from "./ChairAnnouncements";
import {
  Menu,
  X,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Megaphone,
  FileText,
  LogOut,
  Home,
} from "lucide-react";

export default function ChairDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const sidebarLinks = [
    { name: "Dashboard", icon: <Home size={18} /> },
    { name: "Faculty Management", icon: <Users size={18} /> },
    { name: "Approvals", icon: <ClipboardList size={18} /> },
    { name: "Analytics", icon: <BarChart3 size={18} /> },
    { name: "Transcripts", icon: <FileText size={18} /> },
    { name: "Announcements", icon: <Megaphone size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="p-6 space-y-10 animate__animated animate__fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Department Chair
                  </span>
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  Overview of your department's performance & activities
                </p>
              </div>
              <button
                onClick={() => (window.location.href = "/login/chairman")}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Faculty Members"
                value="12"
                icon={<Users size={26} />}
                color="from-blue-500 to-indigo-500"
              />
              <StatCard
                title="Active Students"
                value="280"
                icon={<Users size={26} />}
                color="from-teal-500 to-cyan-500"
              />
              <StatCard
                title="Pending Approvals"
                value="4"
                icon={<ClipboardList size={26} />}
                color="from-orange-500 to-rose-500"
              />
              <StatCard
                title="Announcements"
                value="6"
                icon={<Megaphone size={26} />}
                color="from-purple-500 to-pink-500"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {sidebarLinks.slice(1).map((link, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(link.name)}
                    className="group flex flex-col items-center gap-3 p-5 rounded-xl border hover:shadow-lg hover:-translate-y-1 transform transition-all bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50"
                  >
                    <div className="bg-white p-3 rounded-full shadow-md text-blue-600 group-hover:text-indigo-600 transition">
                      {link.icon}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-700 group-hover:text-indigo-600">
                      {link.name}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "Faculty Management":
        return <FacultyManagement />;

      case "Approvals":
        return <ChairApprovals />;

      case "Analytics":
        return <ChairAnalytics />;

      case "Transcripts":
        return <ChairTranscripts />;

      case "Announcements":
        return <ChairAnnouncements />;

      default:
        return <Placeholder title={activeTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
          <h2 className="text-xl font-bold tracking-wide">
            Department Chair Portal
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
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all ${
                activeTab === link.name
                  ? "bg-white text-indigo-700 shadow-lg"
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
              {link.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
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

/* ======================= Helper Components ======================= */

function StatCard({ title, value, icon, color }) {
  return (
    <div
      className={`p-6 rounded-2xl shadow-md text-white bg-gradient-to-br ${color} hover:shadow-lg hover:scale-[1.02] transition-all`}
    >
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

function Placeholder({ title }) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 animate__animated animate__fadeIn">
      <h1 className="text-2xl font-extrabold text-indigo-700 mb-4 flex items-center gap-2">
        {title}
      </h1>
      <div className="bg-indigo-50 p-8 rounded-xl border border-indigo-100 text-center text-gray-600 text-sm md:text-base">
        This section is under development. Coming soon!
      </div>
    </div>
  );
}
