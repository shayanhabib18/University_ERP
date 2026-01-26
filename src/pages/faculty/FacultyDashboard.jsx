import { useState, useEffect } from "react";
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
  Bell,
  FileText,
  BookMarked,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Courses from "./Courses";
import AiQuizAssignmentForm from "./AiQuizAssignmentForm";
import FacultyAnnouncements from "./FacultyAnnouncements";
import FacultyProfile from "./FacultyProfile";
import FacultyRequests from "./FacultyRequests";
import { getAnnouncementsByRole } from "../../services/announcementAPI";

/* -------------------------------
   Sidebar Links
--------------------------------*/
const sidebarLinks = [
  "Dashboard",
  "My Courses", 
  "Assignments & Quiz",
  "Announcements",
  "Requests",
  "Profile",
];

export default function FacultyDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [counts, setCounts] = useState({ students: 0, courses: 0, announcements: 0 });
  const [loading, setLoading] = useState(false);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [displayName, setDisplayName] = useState("Professor");
  const [facultyId, setFacultyId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // 1) Get faculty profile from token
        const token = localStorage.getItem("facultyToken");
        if (!token) {
          console.warn("No faculty token found");
          setLoading(false);
          return;
        }

        const profileResp = await fetch("http://localhost:5000/faculties/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileResp.ok) {
          console.error("Failed to load faculty profile");
          setLoading(false);
          return;
        }

        const profile = await profileResp.json();
        const id = profile.id;
        setFacultyId(id);
        if (profile.name) setDisplayName(profile.name);

        // 2) Load assigned courses with student counts
        const coursesResp = await fetch(`http://localhost:5000/faculty-courses/faculty/${id}`);
        const coursesData = coursesResp.ok ? await coursesResp.json() : [];

        const coursesCount = Array.isArray(coursesData) ? coursesData.length : 0;
        
        // Calculate active (registered) students by fetching RST data for each course
        let studentsTotal = 0;
        if (Array.isArray(coursesData)) {
          for (const course of coursesData) {
            try {
              const rstResp = await fetch(`http://localhost:5000/rst/course/${course.course.id}`);
              const rstData = rstResp.ok ? await rstResp.json() : [];
              
              // Count students who don't have approved results
              const activeStudents = Array.isArray(rstData)
                ? rstData.filter(rst => rst.approval_status !== 'approved').length
                : 0;
              
              // If no RST data, count total enrolled students
              if (rstData.length === 0) {
                studentsTotal += course.student_count || 0;
              } else {
                studentsTotal += activeStudents;
              }
            } catch (error) {
              console.error(`Error fetching RST for course ${course.course.id}:`, error);
              studentsTotal += course.student_count || 0;
            }
          }
        }

        // 3) Announcements for faculty role
        let announcements = [];
        try {
          announcements = await getAnnouncementsByRole("faculty");
        } catch (e) {
          console.error("Failed to load announcements", e);
        }

        const announcementsCount = Array.isArray(announcements) ? announcements.length : 0;
        const recent = Array.isArray(announcements)
          ? announcements
              .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
              .slice(0, 5)
          : [];

        setCounts({
          students: studentsTotal,
          courses: coursesCount,
          announcements: announcementsCount,
        });

        setRecentAnnouncements(recent.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.content || a.body || "",
          time: a.created_at,
          priority: a.priority || "medium",
        })));
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Prefer stored faculty name; fall back to email prefix
    const storedName = localStorage.getItem("facultyName");
    if (storedName) {
      setDisplayName(storedName);
    } else {
      const email = localStorage.getItem("facultyEmail");
      if (email) {
        const namePart = email.split("@")[0] || "Professor";
        setDisplayName(namePart);
      }
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent 
          counts={counts} 
          loading={loading} 
          recentAnnouncements={recentAnnouncements}
          setActiveTab={setActiveTab}
          navigate={navigate}
          displayName={displayName}
        />;
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-slate-900 text-white w-64 py-7 px-2 fixed inset-y-0 left-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 shadow-xl`}
      >
        <div className="px-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Faculty Portal</h2>
              <p className="text-slate-300 text-xs">Teaching Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-2">
          {sidebarLinks.map((link) => (
            <button
              key={link}
              onClick={() => {
                setActiveTab(link);
                setMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === link
                  ? "bg-indigo-700 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white bg-indigo-600 hover:bg-indigo-700 p-2 rounded shadow"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

/* -------------------------------
   Dashboard Content
--------------------------------*/
function DashboardContent({ counts, loading, recentAnnouncements, setActiveTab, navigate, displayName }) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Faculty Dashboard{" "}
            <span className="text-indigo-600">Overview</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {displayName}! Here's your teaching summary
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Stats Cards - Now only 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Students Enrolled" 
          value={loading ? "..." : counts.students.toString()} 
          icon={<Users className="text-indigo-600" size={20} />}
          color="indigo"
          onClick={() => setActiveTab("My Courses")}
        />
        <StatCard 
          title="Active Courses" 
          value={loading ? "..." : counts.courses.toString()} 
          icon={<BookMarked className="text-blue-600" size={20} />}
          color="blue"
          onClick={() => setActiveTab("My Courses")}
        />
        <StatCard 
          title="Announcements" 
          value={loading ? "..." : counts.announcements.toString()} 
          icon={<Megaphone className="text-orange-600" size={20} />}
          color="orange"
          onClick={() => setActiveTab("Announcements")}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction 
              label="My Courses" 
              onClick={() => setActiveTab("My Courses")} 
              icon={<BookOpen className="text-indigo-600" size={20} />}
              color="indigo"
            />
            <QuickAction 
              label="Assignments" 
              onClick={() => setActiveTab("Assignments & Quiz")} 
              icon={<ClipboardList className="text-emerald-600" size={20} />}
              color="emerald"
            />
            <QuickAction 
              label="Announcements" 
              onClick={() => setActiveTab("Announcements")} 
              icon={<Megaphone className="text-orange-600" size={20} />}
              color="orange"
            />
            <QuickAction 
              label="Profile" 
              onClick={() => setActiveTab("Profile")} 
              icon={<User className="text-purple-600" size={20} />}
              color="purple"
            />
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="text-indigo-600" size={20} />
              Recent Announcements
            </h2>
            <button
              onClick={() => setActiveTab("Announcements")}
              className="text-sm text-indigo-600 hover:underline"
            >
              View All
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading announcements...
            </div>
          ) : recentAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="mx-auto mb-2 text-gray-300" size={40} />
              <p className="text-sm">No recent announcements</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer border border-gray-100"
                  onClick={() => setActiveTab("Announcements")}
                >
                  <div className="flex gap-3">
                    <div className={`w-2 rounded-full ${
                      announcement.priority === 'high' ? 'bg-red-500' : 
                      announcement.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        {announcement.priority === 'high' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{announcement.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Bell size={12} />
                        {announcement.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------
   Reusable Components
--------------------------------*/
function StatCard({ title, value, icon, color, onClick }) {
  const colorClasses = {
    indigo: 'bg-indigo-100',
    blue: 'bg-blue-100',
    orange: 'bg-orange-100'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-2">Click to view details</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label, onClick, icon, color }) {
  const colorClasses = {
    indigo: "border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200",
    emerald: "border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200",
    orange: "border-orange-100 hover:bg-orange-50 hover:border-orange-200",
    purple: "border-purple-100 hover:bg-purple-50 hover:border-purple-200"
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-sm ${colorClasses[color]}`}
    >
      <div className="p-3 bg-gray-50 rounded-lg">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </button>
  );
}