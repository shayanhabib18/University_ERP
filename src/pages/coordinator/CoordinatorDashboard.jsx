import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Bell, FileText, Send, LogOut, Home, Users, BookOpen, User, Mail } from "lucide-react";
import CoordinatorAnnouncements from "./CoordinatorAnnouncements";
import CoordinatorRequests from "./CoordinatorRequests";
import { getAnnouncementsByRole } from "../../services/announcementAPI";
import CoordinatorFaculty from "./CoordinatorFaculty";

const CoordinatorStudents = () => (
  <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
    <h2 className="text-2xl font-bold mb-4 text-gray-800">Students / Transcripts</h2>
    <p className="text-gray-500">Student list, profiles, and transcript generation will appear here.</p>
  </div>
);

const CoordinatorFeedback = () => (
  <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
    <h2 className="text-2xl font-bold mb-4 text-gray-800">Feedback & Reviews</h2>
    <p className="text-gray-500">Student reviews of teachers and feedback scores will appear here.</p>
  </div>
);

// Sidebar order as requested
const sidebarLinks = [
  { name: "Dashboard Overview", icon: <Home size={18} /> },
  { name: "Faculty Management", icon: <Users size={18} /> },
  { name: "Students / Transcripts", icon: <User size={18} /> },
  { name: "Announcements", icon: <Bell size={18} /> },
  { name: "Requests", icon: <Mail size={18} /> },
  { name: "Feedback", icon: <FileText size={18} /> }
];

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard Overview");
  const [pendingRequests, setPendingRequests] = useState(12);
  const [coordinatorName, setCoordinatorName] = useState("Coordinator");
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    totalFaculty: 0,
    totalStudents: 0,
  });

  // Load coordinator name from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("coordinator_info");
      if (stored) {
        const info = JSON.parse(stored);
        setCoordinatorName(info.full_name || info.name || "Coordinator");
        return;
      }

      const token = localStorage.getItem("coordinator_token");
      if (token) {
        fetch("http://localhost:5000/coordinators/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              localStorage.setItem("coordinator_info", JSON.stringify(data));
              setCoordinatorName(data.full_name || data.name || "Coordinator");
            }
          })
          .catch((err) => console.warn("Failed to fetch coordinator profile", err));
      }
    } catch (err) {
      console.warn("Failed to load coordinator name", err);
      setCoordinatorName("Coordinator");
    }
  }, []);

  // Fetch announcements for coordinator
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoadingAnnouncements(true);
        const result = await getAnnouncementsByRole("coordinator");
        const announcements = result.data || [];
        const sorted = announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentAnnouncements(sorted.slice(0, 2));
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setRecentAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const coursesResponse = await fetch("http://localhost:5000/courses");
        const courses = coursesResponse.ok ? await coursesResponse.json() : [];

        const facultyResponse = await fetch("http://localhost:5000/faculty");
        const faculty = facultyResponse.ok ? await facultyResponse.json() : [];

        const studentsResponse = await fetch("http://localhost:5000/students");
        const students = studentsResponse.ok ? await studentsResponse.json() : [];

        const requestsResponse = await fetch("http://localhost:5000/requests/pending");
        const requests = requestsResponse.ok ? await requestsResponse.json() : [];

        setDashboardStats({
          totalCourses: courses.length,
          totalFaculty: faculty.length,
          totalStudents: students.length,
        });

        setPendingRequests(requests.length);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

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
                    {coordinatorName}
                  </span>
                </h1>
                <p className="text-gray-500 mt-1">Department overview & management</p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pending Requests */}
              <div
                className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setActiveTab("Requests")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Mail className="text-amber-600" size={20} />
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
                <p className="text-sm text-gray-500 mt-1">Require your attention</p>
              </div>

              {/* Total Courses */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <BookOpen className="text-emerald-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">Total Courses</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">{dashboardStats.totalCourses}</p>
                <p className="text-sm text-gray-500 mt-1">In department</p>
              </div>

              {/* Total Faculty */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Users className="text-indigo-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">Total Faculty</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">{dashboardStats.totalFaculty}</p>
                <p className="text-sm text-gray-500 mt-1">Active in department</p>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Students */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">Total Students</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">{dashboardStats.totalStudents}</p>
                <p className="text-sm text-gray-500 mt-1">Enrolled in department</p>
              </div>

              {/* Recent Announcements */}
              <div
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setActiveTab("Announcements")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Bell className="text-purple-600" size={20} />
                    </div>
                    <h3 className="text-gray-500 font-medium">Recent Announcements</h3>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {loadingAnnouncements ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : recentAnnouncements.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent announcements</p>
                  ) : (
                    recentAnnouncements.map((announcement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-indigo-100 p-1 rounded-full mt-1">
                          <Bell size={14} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{announcement.title}</p>
                          <p className="text-xs text-gray-500">From: {announcement.senderName}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {recentAnnouncements.length > 0 && (
                  <p className="text-blue-600 text-sm mt-3 text-right">View all</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sidebarLinks
                  .filter((link) => link.name !== "Dashboard Overview")
                  .map((link, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(link.name)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                    >
                      <div className="bg-blue-100 p-3 rounded-full text-blue-600">{link.icon}</div>
                      <h3 className="font-medium text-sm text-center">{link.name}</h3>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );

      case "Faculty Management":
        return <CoordinatorFaculty />;

      case "Students / Transcripts":
        return <CoordinatorStudents />;

      case "Announcements":
        return <CoordinatorAnnouncements />;

      case "Requests":
        return <CoordinatorRequests setPendingRequests={setPendingRequests} />;

      case "Feedback":
        return <CoordinatorFeedback />;

      default:
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                {sidebarLinks.find((link) => link.name === activeTab)?.icon}
              </div>
              <h1 className="text-2xl font-bold text-blue-700">{activeTab}</h1>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <p className="text-gray-600 text-center">Content will be available soon</p>
            </div>
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
              <span className={`${activeTab === link.name ? "text-blue-600" : "text-gray-400"}`}>
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
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6 overflow-auto">{renderContent()}</main>
    </div>
  );
}
