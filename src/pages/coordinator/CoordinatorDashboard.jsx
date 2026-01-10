import { useState } from "react";
import { Menu, X, Bell, FileText, Send, LogOut, Home } from "lucide-react";
import CoordinatorAnnouncements from "./CoordinatorAnnouncements";
import CoordinatorRequests from "./CoordinatorRequests";

const sidebarLinks = [
  { name: "Dashboard Overview", icon: <Home size={18} /> },
  { name: "Announcements", icon: <FileText size={18} /> },
  { name: "Requests", icon: <Send size={18} /> }
];

export default function CoordinatorDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard Overview");
  const [pendingRequests, setPendingRequests] = useState(12);

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard Overview":
        return (
          <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Welcome back,{" "}
                  <span className="text-gradient bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Coordinator
                  </span>
                </h1>
                <p className="text-gray-500 mt-1">Department overview & management</p>
              </div>
              <button
                onClick={() => (window.location.href = "/login/coordinator")}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* Pending Requests Card */}
              <div 
                className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setActiveTab("Requests")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Send className="text-amber-600" size={20} />
                    </div>
                    <h3 className="text-gray-500 font-medium">Pending Requests</h3>
                  </div>
                  {pendingRequests > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingRequests}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">{pendingRequests}</p>
              </div>

              {/* Total Courses Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <FileText className="text-emerald-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">Total Courses</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">85</p>
                <p className="text-sm text-gray-500 mt-1">45 undergraduate, 40 postgraduate</p>
              </div>
            </div>
          </div>
        );

      case "Announcements":
        return <CoordinatorAnnouncements />;

      case "Requests":
        return <CoordinatorRequests setPendingRequests={setPendingRequests} />;

      default:
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <p className="text-gray-600 text-center">Content will be available soon</p>
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
            <Send className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Coordinator Portal</h2>
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
              <span
                className={`${activeTab === link.name ? "text-blue-600" : "text-gray-400"}`}
              >
                {link.icon}
              </span>
              {link.name}
              {link.name === "Requests" && pendingRequests > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingRequests}
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
