import { useState } from "react";
import { Menu, X } from "lucide-react";
import Courses from "./Courses";
import Notifications from "./Notifications";
import Transcript from "./Transcript";
import Profile from "./Profile";
import Requests from "./Requests";

const sidebarLinks = [
  "Dashboard Overview",
  "My Profile",
  "Courses / Enrollments",
  "Requests / Messages",
  "Notifications",
];


export default function StudentDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard Overview");

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard Overview":
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-blue-700">Welcome, Student 👋</h1>
              <button
                onClick={() => (window.location.href = "/login/student")}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">📊 Attendance</h2>
                <p className="text-2xl text-blue-600 font-bold">92%</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">📈 CGPA</h2>
                <p className="text-2xl text-green-600 font-bold">3.8</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">🔔 Notifications</h2>
                <p className="text-2xl text-orange-600 font-bold">3 new updates</p>
              </div>
            </div>
          </>
        );
      case "My Profile":
        return <Profile />;
      case "Courses / Enrollments":
        return <Courses />;
      case "Attendance":
        return <Attendance />;
      case "Transcript / Academic Report":
        return <Transcript />;
      case "Requests / Messages":
        return <Requests />;
      case "Notifications":
        return <Notifications />;
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
        className={`bg-black text-white w-64 py-7 px-2 fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 shadow-xl`}
      >
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-6">🎓 Student Panel</h2>
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <button
              key={link}
              onClick={() => {
                setActiveTab(link);
                setMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === link
                  ? "bg-blue-600 font-semibold text-white"
                  : "hover:bg-gray-800"
              }`}
            >
              {link}
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
