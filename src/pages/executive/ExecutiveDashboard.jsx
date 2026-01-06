import { useState, useEffect } from "react";
import ExecutiveAnnouncements from "./ExecutiveAnnouncements";
import ExecutiveDepartments from "./ExecutiveDepartments";
import ExecutiveReports from "./ExecutiveReports";
import { getAnnouncementsByRole } from "../../services/announcementAPI";
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

// Helper function to calculate time ago
const getTimeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
};

export default function ExecutiveDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  const sidebarLinks = [
    { name: "Dashboard", icon: <Home size={18} /> },
    { name: "Departments", icon: <Building2 size={18} /> },
    { name: "Reports", icon: <FileText size={18} /> },
    { name: "Announcements", icon: <Megaphone size={18} /> },
  ];

  // Fetch announcements for executive
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoadingAnnouncements(true);
        const result = await getAnnouncementsByRole("executive");
        const announcements = result.data || [];
        
        // Sort by date and get the most recent 3
        const sorted = announcements.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setRecentAnnouncements(sorted.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setRecentAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

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
                {loadingAnnouncements ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500">Loading announcements...</p>
                  </div>
                ) : recentAnnouncements.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500">No recent announcements</p>
                  </div>
                ) : (
                  recentAnnouncements.map((announcement, index) => {
                    const colors = [
                      { bg: "bg-blue-50", border: "border-blue-500", dot: "bg-blue-500" },
                      { bg: "bg-green-50", border: "border-green-500", dot: "bg-green-500" },
                      { bg: "bg-purple-50", border: "border-purple-500", dot: "bg-purple-500" },
                    ];
                    const color = colors[index % colors.length];
                    
                    // Calculate time ago
                    const timeAgo = getTimeAgo(announcement.createdAt);
                    
                    return (
                      <div 
                        key={announcement.id}
                        className={`flex items-start gap-3 p-3 ${color.bg} rounded-lg border-l-4 ${color.border} hover:shadow-md transition-all cursor-pointer`}
                        onClick={() => setActiveTab("Announcements")}
                      >
                        <div className={`w-2 h-2 ${color.dot} rounded-full mt-2`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                            {announcement.title}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {announcement.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">From: {announcement.senderName}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">{timeAgo}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
