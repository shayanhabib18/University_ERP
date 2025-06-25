import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DepartmentManagement from "./DepartmentManagement";
import FacultyManagement from "./FacultyManagement";
import StudentManagement from "./StudentManagement";
import HandleRequests from "./HandleRequests"


const sidebarLinks = [
  "Overview",
  "Add Departments & Courses",
  "Faculty Management",
  "Student Management",
  "Requests",
];

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-indigo-700">Welcome, Admin!</h1>
              <button
                onClick={() => navigate("/")}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h2 className="text-lg font-semibold text-slate-700">Total Students</h2>
                <p className="text-2xl text-indigo-600 font-bold">512</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h2 className="text-lg font-semibold text-slate-700">Total Faculty</h2>
                <p className="text-2xl text-indigo-600 font-bold">45</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h2 className="text-lg font-semibold text-slate-700">Courses</h2>
                <p className="text-2xl text-indigo-600 font-bold">67</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-2 text-slate-800">Charts & Statistics</h2>
                <div className="h-40 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  [Chart Placeholder]
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-2 text-slate-800">Recent Requests</h2>
                <ul className="text-slate-700 list-disc ml-5 space-y-2">
                  <li>Student ID 12003 requested slip</li>
                  <li>Faculty ID 45 marked attendance</li>
                  <li>New course approval pending</li>
                </ul>
              </div>
            </div>
          </>
        );

      case "Add Departments & Courses":
        return <DepartmentManagement />;

      case "Faculty Management":
        return <FacultyManagement />;

      case "Manage Students":
        return <StudentManagement />;

      case "Department Students":
        return <DepartmentStudents />;

      case "Student Management":
        return<StudentManagement/>;
      
      case "Requests":
        return <HandleRequests/>;
        
      default:
        return (
          <div className="bg-white p-6 rounded-xl shadow">
            <h1 className="text-2xl font-bold mb-4 text-indigo-700">{activeTab}</h1>
            <p className="text-gray-600">Content for {activeTab} will be displayed here</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white w-64 py-7 px-2 fixed inset-y-0 left-0 transform ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 shadow-xl`}>
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <button
              key={link}
              onClick={() => {
                setActiveTab(link);
                setMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === link ? "bg-indigo-700 font-semibold text-white" : "hover:bg-indigo-600"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="text-white bg-indigo-600 hover:bg-indigo-700 p-2 rounded shadow"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main content area */}
      <main className="flex-1 ml-0 md:ml-64 p-6">
        {renderContent()}
      </main>
    </div>
  );
}
