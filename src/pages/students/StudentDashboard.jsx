import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Bell, BookOpen, ClipboardList, FileText, Mail, User, LogOut, Home, BarChart2, CheckCircle } from "lucide-react";
import Courses from "./Courses";
import Notifications from "./Notifications";
import AssignmentsQuizzes from "./AssignmentsQuizzes";
import Profile from "./Profile";
import Requests from "./Requests";
import CourseMaterials from "./CourseMaterials";
import { getAnnouncementsByRole } from "../../services/announcementAPI";

const sidebarLinks = [
  { name: "Dashboard Overview", icon: <Home size={18} /> },
  { name: "My Profile", icon: <User size={18} /> },
  { name: "Assignments & Quizzes", icon: <ClipboardList size={18} /> },
  { name: "Courses / Enrollments", icon: <BookOpen size={18} /> },
  { name: "Course Materials", icon: <FileText size={18} /> },
  { name: "Requests / Messages", icon: <Mail size={18} /> },
  { name: "Notifications", icon: <Bell size={18} /> }
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard Overview");
  const [studentName, setStudentName] = useState("Student");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    cgpa: "Loading...",
    gpa: "Loading...",
    enrolledCourses: 0,
  });

  // Load student name from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("student_info");
      if (stored) {
        const info = JSON.parse(stored);
        setStudentName(info.full_name || info.roll_number || "Student");
        return;
      }

      // Fallback: fetch from backend using token
      const token = localStorage.getItem("studentToken") || localStorage.getItem("student_token");
      if (token) {
        fetch("http://localhost:5000/students/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              localStorage.setItem("student_info", JSON.stringify(data));
              setStudentName(data.full_name || data.roll_number || "Student");
            }
          })
          .catch((err) => {
            console.warn("Failed to fetch student profile", err);
          });
      }
    } catch (err) {
      console.warn("Failed to load student name", err);
      setStudentName("Student");
    }
  }, []);

  // Fetch announcements for student
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoadingAnnouncements(true);
        const result = await getAnnouncementsByRole("student");
        const announcements = result.data || [];
        
        // Sort by date and get the most recent 2
        const sorted = announcements.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setRecentAnnouncements(sorted.slice(0, 2));
        setUnreadNotifications(announcements.length);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setRecentAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Helper functions for GPA calculation
  const getGradePoints = (grade) => {
    const gradeMap = {
      'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0
    };
    return gradeMap[grade] || 0;
  };

  const calculateSemesterGPA = (courses) => {
    let totalGradePoints = 0;
    let totalCredits = 0;
    let hasGrades = false;
    
    courses.forEach(course => {
      if (course.grade && course.grade !== "Result Awaited") {
        hasGrades = true;
        totalGradePoints += getGradePoints(course.grade) * (course.creditHours || 0);
        totalCredits += course.creditHours || 0;
      }
    });
    
    return !hasGrades || totalCredits === 0 ? "Result Awaited" : (totalGradePoints / totalCredits).toFixed(2);
  };

  const calculateCGPA = (enrollmentsList) => {
    let totalGradePoints = 0;
    let totalCredits = 0;
    let hasAnyGrades = false;
    
    enrollmentsList.forEach(semester => {
      if (semester.courses) {
        semester.courses.forEach(course => {
          if (course.grade && course.grade !== "Result Awaited") {
            hasAnyGrades = true;
            totalGradePoints += getGradePoints(course.grade) * (course.creditHours || 0);
            totalCredits += course.creditHours || 0;
          }
        });
      }
    });
    
    return !hasAnyGrades || totalCredits === 0 ? "Result Awaited" : (totalGradePoints / totalCredits).toFixed(2);
  };

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const studentInfoStr = localStorage.getItem("student_info");
        if (!studentInfoStr) return;

        const studentInfo = JSON.parse(studentInfoStr);
        const studentId = studentInfo.id;

        // Fetch enrollments
        const enrollmentsResponse = await fetch(`http://localhost:5000/students/enrollments/student/${studentId}`);
        const enrollments = enrollmentsResponse.ok ? await enrollmentsResponse.json() : [];

        // Group enrollments by semester
        const grouped = {};
        enrollments.forEach(enrollment => {
          const semester = enrollment.semester || 1;
          if (!grouped[semester]) {
            grouped[semester] = { semester, courses: [] };
          }

          // Normalize course shape so RST fetch works reliably
          grouped[semester].courses.push({
            id: enrollment.course_id || enrollment.id, // used for RST fetch
            courseCode: enrollment.course_code || `COURSE-${enrollment.course_id || enrollment.id}`,
            name: enrollment.course_name || enrollment.name || "Course Name",
            creditHours: enrollment.credit_hours || enrollment.credits || 3,
            grade: enrollment.grade || "Result Awaited",
          });
        });

        const semestersArray = Object.values(grouped).sort((a, b) => b.semester - a.semester);

        if (semestersArray.length === 0) {
          setDashboardStats({ cgpa: "Result Awaited", gpa: "Result Awaited", enrolledCourses: 0 });
          return;
        }

        // Fetch RST data for each course to get grade and status
        for (const semester of semestersArray) {
          for (const course of semester.courses) {
            if (!course.id) continue; // skip if course id missing
            try {
              const rstResponse = await fetch(
                `http://localhost:5000/rst/student/${studentId}/course/${course.id}`
              );
              if (rstResponse.ok) {
                const rstData = await rstResponse.json();
                course.grade = rstData.grade || "Result Awaited";
              }
            } catch (err) {
              console.log(`No RST found for course ${course.id}`);
            }
          }
        }

        // Get current semester (most recent)
        const currentSemester = semestersArray[0];
        const currentEnrollments = currentSemester?.courses || [];

        // Calculate current semester GPA
        const currentGPA = calculateSemesterGPA(currentEnrollments);

        // Calculate overall CGPA
        const cgpa = calculateCGPA(semestersArray);

        setDashboardStats({
          cgpa: cgpa,
          gpa: currentGPA,
          enrolledCourses: currentEnrollments.length,
        });
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
                    {studentName}
                  </span>
                </h1>
                <p className="text-gray-500 mt-1">Here's your academic summary</p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Stats Cards (Attendance removed) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CGPA Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <BarChart2 className="text-indigo-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">CGPA</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">{dashboardStats.cgpa}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 mr-2">Current:</span>
                  <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {dashboardStats.gpa} GPA
                  </span>
                </div>
              </div>

              {/* Courses Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <BookOpen className="text-emerald-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">Enrolled Courses</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">{dashboardStats.enrolledCourses}</p>
                <p className="text-sm text-gray-500 mt-1">Current semester</p>
              </div>

              {/* Notifications Card */}
              <div
                className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setActiveTab("Notifications")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Bell className="text-amber-600" size={20} />
                    </div>
                    <h3 className="text-gray-500 font-medium">Notifications</h3>
                  </div>
                  {unreadNotifications > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  {loadingAnnouncements ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : recentAnnouncements.length === 0 ? (
                    <p className="text-sm text-gray-500">No new notifications</p>
                  ) : (
                    recentAnnouncements.map((announcement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-blue-100 p-1 rounded-full mt-1">
                          <Bell size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{announcement.title}</p>
                          <p className="text-xs text-gray-500">
                            From: {announcement.senderName}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {unreadNotifications > 2 && (
                  <p className="text-blue-600 text-sm mt-3 text-right">
                    +{unreadNotifications - 2} more
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sidebarLinks
                  .filter(
                    (link) =>
                      link.name !== "Dashboard Overview" &&
                      link.name !== "Notifications"
                  )
                  .map((link, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(link.name)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                    >
                      <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        {link.icon}
                      </div>
                      <h3 className="font-medium text-sm text-center">{link.name}</h3>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );

      case "My Profile":
        return <Profile />;
      case "Courses / Enrollments":
        return <Courses />;
      case "Course Materials":
        return <CourseMaterials />;
      case "Assignments & Quizzes":
        return <AssignmentsQuizzes />;
      case "Requests / Messages":
        return <Requests />;
      case "Notifications":
        return <Notifications setUnreadNotifications={setUnreadNotifications} />;
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
            <User className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Student Portal</h2>
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
                className={`${
                  activeTab === link.name ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {link.icon}
              </span>
              {link.name}
              {link.name === "Notifications" && unreadNotifications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
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
