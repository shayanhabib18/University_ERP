import { useState } from "react";
import { Menu, X, Bell, Users, FileText, Send, LogOut, Home, BarChart2, BookOpen, Download, Eye, EyeOff, ChevronDown } from "lucide-react";
import CoordinatorAnnouncements from "./CoordinatorAnnouncements";
import CoordinatorRequests from "./CoordinatorRequests";

const sidebarLinks = [
  { name: "Dashboard Overview", icon: <Home size={18} /> },
  { name: "Student Management", icon: <Users size={18} /> },
  { name: "Announcements", icon: <FileText size={18} /> },
  { name: "Requests", icon: <Send size={18} /> }
];

export default function CoordinatorDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard Overview");
  const [pendingRequests, setPendingRequests] = useState(12);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);

  // Sample student data with personal information and academic history
  const [students] = useState([
    {
      id: 1,
      name: "Ahmed Hassan",
      email: "ahmed.hassan@university.edu",
      phone: "+92 300 1234567",
      dob: "2002-05-15",
      cnic: "41101-1234567-1",
      fatherName: "Hassan Khan",
      currentAddress: "123 Main Street, Karachi",
      permanentAddress: "456 Defence Road, Karachi",
      academicHistory: [
        {
          semester: "Fall 2023",
          courses: [
            { code: "CS101", name: "Introduction to Programming", grade: "A", credits: 3 },
            { code: "MTH101", name: "Calculus I", grade: "B+", credits: 4 },
            { code: "ENG101", name: "English Composition", grade: "A", credits: 3 }
          ]
        },
        {
          semester: "Spring 2024",
          courses: [
            { code: "CS102", name: "Data Structures", grade: "A-", credits: 4 },
            { code: "MTH102", name: "Calculus II", grade: "B", credits: 4 },
            { code: "PHY101", name: "Physics I", grade: "A", credits: 3 }
          ]
        },
        {
          semester: "Fall 2024",
          courses: [
            { code: "CS201", name: "Algorithms", grade: "A", credits: 4 },
            { code: "CS202", name: "Database Systems", grade: "A-", credits: 3 },
            { code: "MTH201", name: "Linear Algebra", grade: "B+", credits: 3 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Fatima Ali",
      email: "fatima.ali@university.edu",
      phone: "+92 321 9876543",
      dob: "2003-03-22",
      cnic: "42102-9876543-2",
      fatherName: "Ali Raza",
      currentAddress: "789 Elm Street, Lahore",
      permanentAddress: "321 Oak Avenue, Lahore",
      academicHistory: [
        {
          semester: "Fall 2023",
          courses: [
            { code: "CS101", name: "Introduction to Programming", grade: "B+", credits: 3 },
            { code: "MTH101", name: "Calculus I", grade: "A", credits: 4 },
            { code: "ENG101", name: "English Composition", grade: "A", credits: 3 }
          ]
        },
        {
          semester: "Spring 2024",
          courses: [
            { code: "CS102", name: "Data Structures", grade: "B", credits: 4 },
            { code: "MTH102", name: "Calculus II", grade: "A-", credits: 4 },
            { code: "CHM101", name: "Chemistry I", grade: "A", credits: 3 }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Muhammad Usman",
      email: "usman.muhammad@university.edu",
      phone: "+92 333 5555555",
      dob: "2002-07-10",
      cnic: "41703-5555555-3",
      fatherName: "Muhammad Khan",
      currentAddress: "555 Pine Road, Islamabad",
      permanentAddress: "999 Maple Street, Islamabad",
      academicHistory: [
        {
          semester: "Fall 2023",
          courses: [
            { code: "CS101", name: "Introduction to Programming", grade: "A", credits: 3 },
            { code: "MTH101", name: "Calculus I", grade: "A", credits: 4 }
          ]
        },
        {
          semester: "Spring 2024",
          courses: [
            { code: "CS102", name: "Data Structures", grade: "A", credits: 4 },
            { code: "MTH102", name: "Calculus II", grade: "A", credits: 4 },
            { code: "PHY101", name: "Physics I", grade: "B+", credits: 3 }
          ]
        },
        {
          semester: "Fall 2024",
          courses: [
            { code: "CS201", name: "Algorithms", grade: "B+", credits: 4 },
            { code: "CS202", name: "Database Systems", grade: "A", credits: 3 }
          ]
        }
      ]
    }
  ]);

  // Generate transcript function
  const generateTranscript = (student) => {
    let transcriptContent = `========================================\n`;
    transcriptContent += `STUDENT TRANSCRIPT\n`;
    transcriptContent += `========================================\n\n`;
    
    transcriptContent += `PERSONAL INFORMATION\n`;
    transcriptContent += `----------------------------------------\n`;
    transcriptContent += `Name: ${student.name}\n`;
    transcriptContent += `Email: ${student.email}\n`;
    transcriptContent += `Phone: ${student.phone}\n`;
    transcriptContent += `Date of Birth: ${student.dob}\n`;
    transcriptContent += `CNIC: ${student.cnic}\n`;
    transcriptContent += `Father's Name: ${student.fatherName}\n`;
    transcriptContent += `Current Address: ${student.currentAddress}\n`;
    transcriptContent += `Permanent Address: ${student.permanentAddress}\n\n`;
    
    transcriptContent += `ACADEMIC HISTORY\n`;
    transcriptContent += `----------------------------------------\n`;
    
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    student.academicHistory.forEach((sem) => {
      transcriptContent += `\n${sem.semester}\n`;
      transcriptContent += `${'-'.repeat(40)}\n`;
      sem.courses.forEach((course) => {
        transcriptContent += `${course.code.padEnd(10)} | ${course.name.padEnd(25)} | ${course.grade.padEnd(5)} | ${course.credits} Credits\n`;
        totalCredits += course.credits;
      });
    });
    
    transcriptContent += `\n========================================\n`;
    transcriptContent += `SUMMARY\n`;
    transcriptContent += `========================================\n`;
    transcriptContent += `Total Credits: ${totalCredits}\n`;
    transcriptContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
    
    // Create download link
    const element = document.createElement("a");
    const file = new Blob([transcriptContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Transcript_${student.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getGradeColor = (grade) => {
    if (grade.includes("A")) return "bg-green-100 text-green-800";
    if (grade.includes("B")) return "bg-blue-100 text-blue-800";
    if (grade.includes("C")) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

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
              {/* Total Students Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Users className="text-indigo-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">Total Students</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">1,247</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 mr-2">This semester:</span>
                  <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    342 students
                  </span>
                </div>
              </div>

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
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <Send size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Course enrollment requests</p>
                      <p className="text-xs text-gray-500">8 pending approval</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-1">
                      <Send size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Document requests</p>
                      <p className="text-xs text-gray-500">4 pending review</p>
                    </div>
                  </div>
                </div>
                {pendingRequests > 2 && (
                  <p className="text-blue-600 text-sm mt-3 text-right">
                    +{pendingRequests - 2} more
                  </p>
                )}
              </div>

              {/* Total Courses Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <BookOpen className="text-emerald-600" size={20} />
                  </div>
                  <h3 className="text-gray-500 font-medium">Total Courses</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-4">85</p>
                <p className="text-sm text-gray-500 mt-1">45 undergraduate, 40 postgraduate</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sidebarLinks
                  .filter(
                    (link) =>
                      link.name !== "Dashboard Overview"
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

      case "Announcements":
        return <CoordinatorAnnouncements />;
      case "Requests":
        return <CoordinatorRequests setPendingRequests={setPendingRequests} />;
      case "Student Management":
        return (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
              <p className="text-gray-500 mt-1">View student details, academic history, and generate transcripts</p>
            </div>

            {/* Student List Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Student Records</h2>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                        >
                          {expandedStudent === student.id ? (
                            <>
                              <EyeOff size={16} />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye size={16} />
                              View
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => generateTranscript(student)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedStudent === student.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                        {/* Personal Information */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-4">Personal Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                              <p className="text-xs text-gray-600 uppercase font-semibold">Email</p>
                              <p className="text-sm text-gray-800 mt-1">{student.email}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                              <p className="text-xs text-gray-600 uppercase font-semibold">Phone</p>
                              <p className="text-sm text-gray-800 mt-1">{student.phone}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                              <p className="text-xs text-gray-600 uppercase font-semibold">Date of Birth</p>
                              <p className="text-sm text-gray-800 mt-1">{student.dob}</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                              <p className="text-xs text-gray-600 uppercase font-semibold">CNIC</p>
                              <p className="text-sm text-gray-800 mt-1">{student.cnic}</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200 md:col-span-2">
                              <p className="text-xs text-gray-600 uppercase font-semibold">Father's Name</p>
                              <p className="text-sm text-gray-800 mt-1">{student.fatherName}</p>
                            </div>
                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200 md:col-span-2">
                              <p className="text-xs text-gray-600 uppercase font-semibold">Current Address</p>
                              <p className="text-sm text-gray-800 mt-1">{student.currentAddress}</p>
                            </div>
                            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border border-cyan-200 md:col-span-2">
                              <p className="text-xs text-gray-600 uppercase font-semibold">Permanent Address</p>
                              <p className="text-sm text-gray-800 mt-1">{student.permanentAddress}</p>
                            </div>
                          </div>
                        </div>

                        {/* Academic History */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-4">Academic History</h4>
                          <div className="space-y-4">
                            {student.academicHistory.map((semester, idx) => (
                              <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                <h5 className="font-medium text-gray-800 mb-3">{semester.semester}</h5>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                  {semester.courses.map((course, cidx) => (
                                    <div key={cidx} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{course.code}</p>
                                        <p className="text-xs text-gray-500">{course.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{course.credits} Credits</p>
                                      </div>
                                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(course.grade)}`}>
                                        {course.grade}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
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
            <Users className="text-white" size={24} />
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
                className={`${
                  activeTab === link.name ? "text-blue-600" : "text-gray-400"
                }`}
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

function Placeholder({ title }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <BarChart2 className="text-blue-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-blue-700">{title}</h1>
      </div>
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <p className="text-gray-600 text-center">This section is under development. Coming soon!</p>
      </div>
    </div>
  );
}