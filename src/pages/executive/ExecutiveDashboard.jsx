import { useState } from "react";
import ExecutiveAnnouncements from "./ExecutiveAnnouncements";
import ExecutiveDepartments from "./ExecutiveDepartments";
import ExecutiveReports from "./ExecutiveReports";
import {
  Menu,
  X,
  Building2,
  Megaphone,
  FileText,
  Home,
  LogOut,
  Users,
  Bell,
  ChevronRight,
} from "lucide-react";

export default function ExecutiveDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const sidebarLinks = [
    { name: "Dashboard", icon: <Home size={18} /> },
    { name: "Departments", icon: <Building2 size={18} /> },
    { name: "Reports", icon: <FileText size={18} /> },
    { name: "Announcements", icon: <Megaphone size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="p-6 md:p-8 space-y-8 animate__animated animate__fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                    <Home className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                      Executive Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm md:text-base">
                      Comprehensive overview of institutional performance
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => (window.location.href = "/login/executive")}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 font-semibold"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Quick Actions
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Access key features and reports
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sidebarLinks.slice(1).map((link, index) => {
                  const descriptions = {
                    "Departments": "Manage and view department details",
                    "Reports": "Access comprehensive institutional reports",
                    "Announcements": "Create and manage announcements"
                  };
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveTab(link.name)}
                      className="group flex items-center gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transform transition-all bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 text-left"
                    >
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 p-4 rounded-xl shadow-sm transition-all">
                        <div className="text-blue-600 group-hover:text-indigo-700">
                          {link.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 mb-1 text-lg">
                          {link.name}
                        </h3>
                        <p className="text-sm text-gray-600 group-hover:text-gray-700">
                          {descriptions[link.name] || "Access this section"}
                        </p>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" size={20} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity / Notifications Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Bell className="text-amber-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Recent Updates</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">New Department Report</p>
                    <p className="text-xs text-gray-600">Computer Science department report submitted</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Faculty Performance Review</p>
                    <p className="text-xs text-gray-600">Quarterly review completed for all departments</p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Student Achievement Report</p>
                    <p className="text-xs text-gray-600">Annual student performance metrics updated</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Departments":
        return <ExecutiveDepartments />;

      case "Reports":
        return <ExecutiveReports />;

      case "Announcements":
        return <ExecutiveAnnouncements />;

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
            <Building2 className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-wide">Executive Portal</h2>
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
