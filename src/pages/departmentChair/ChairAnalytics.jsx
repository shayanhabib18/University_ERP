import { useState, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  GraduationCap,
  Users,
  TrendingUp,
  BookOpen,
  BarChart3,
  Download,
  CheckCircle,
  Loader,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ChairAnalytics() {
  const [loading, setLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState("Software Engineering");
  const [studentPerformanceData, setStudentPerformanceData] = useState([]);
  const [passFailData, setPassFailData] = useState([]);
  const [allPerformanceData, setAllPerformanceData] = useState([]);
  const [allPassFailData, setAllPassFailData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [analytics, setAnalytics] = useState({
    avgGPA: "0.00",
    totalStudents: 0,
    coursesOffered: 0,
  });
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("facultyToken");
        
        if (!token) {
          console.error("No faculty token found");
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch profile to get department
        const profileRes = await fetch("http://localhost:5000/faculties/profile", { headers });
        if (!profileRes.ok) {
          console.error("Profile fetch error:", profileRes.status, profileRes.statusText);
          setLoading(false);
          return;
        }

        const profile = await profileRes.json();
        const departmentId = profile.department_id;
        console.log("Department ID:", departmentId);

        if (departmentId) {
          try {
            const deptRes = await fetch(`http://localhost:5000/departments/${departmentId}`, {
              headers,
            });
            if (deptRes.ok) {
              const dept = await deptRes.json();
              setDepartmentName(dept.name || "Software Engineering");
            }
          } catch (err) {
            console.error("Error fetching department:", err);
          }
        }

        // Fetch department students
        const studentsRes = await fetch(
          `http://localhost:5000/students/department/${departmentId}`,
          { headers }
        );

        if (!studentsRes.ok) {
          console.error("Students fetch error:", studentsRes.status);
          setLoading(false);
          return;
        }

        const studentsData = await studentsRes.json();
        const totalStudents = studentsData.length;
        console.log("Total students:", totalStudents, "Students:", studentsData);

        // Fetch courses for the department
        const coursesRes = await fetch("http://localhost:5000/courses", { headers });
        const coursesData = coursesRes.ok ? await coursesRes.json() : [];
        const departmentCourses = coursesData.filter((c) => c.department_id === departmentId);
        const coursesOffered = departmentCourses.length;
        console.log("Courses offered:", coursesOffered);
        console.log("Department Courses with semester info:", departmentCourses);

        // Create a map of course name/title to semester
        const courseToSemesterMap = {};
        departmentCourses.forEach(course => {
          const courseName = course.course_title || course.title || course.name || course.course_name;
          const semester = course.semester || course.semester_id || course.semester_number;
          if (courseName && semester) {
            courseToSemesterMap[courseName.toLowerCase().trim()] = semester;
          }
        });
        console.log("Course to Semester Map:", courseToSemesterMap);

        // Calculate GPA by course and overall statistics
        const courseGPAMap = {};
        let totalGPASum = 0;
        let studentsWithGPA = 0;
        let passedCount = 0;
        let failedCount = 0;

        await Promise.all(
          studentsData.map(async (student) => {
            try {
              // Skip academic-records (404 endpoint), go straight to RST which works
              let transcriptData = [];
              
              try {
                const rstRes = await fetch(
                  `http://localhost:5000/rst/student/${student.id}/transcript`,
                  { headers }
                );
                if (rstRes.ok) {
                  transcriptData = await rstRes.json();
                }
              } catch (err) {
                console.warn("RST fetch failed:", err);
              }
              
              console.log(`Transcript for student ${student.id}:`, transcriptData);

              transcriptData.forEach((record) => {
                const { courseName, grade, creditHours, semester } = mapRSTRecord(record, courseToSemesterMap);
                const gradePoint = getGradePoint(grade);

                console.log(`  Course: ${courseName}, Grade: ${grade}, Point: ${gradePoint}, Credits: ${creditHours}, Semester: ${semester}`);

                // Only count courses with valid grades
                if (gradePoint !== null && creditHours > 0) {
                  // Use course name + semester as unique key
                  const courseKey = `${courseName}|${semester}`;
                  if (!courseGPAMap[courseKey]) {
                    courseGPAMap[courseKey] = { totalPoints: 0, totalCredits: 0, course: courseName, semester };
                  }
                  courseGPAMap[courseKey].totalPoints += gradePoint * creditHours;
                  courseGPAMap[courseKey].totalCredits += creditHours;

                  // Count pass/fail
                  if (gradePoint > 0) {
                    passedCount++;
                  } else {
                    failedCount++;
                  }
                }
              });

              // Calculate student GPA
              const studentGPA = calculateStudentGPA(transcriptData, courseToSemesterMap);
              if (studentGPA > 0) {
                totalGPASum += studentGPA;
                studentsWithGPA++;
              }
            } catch (err) {
              console.error("Error fetching student records:", err);
            }
          })
        );

        // Convert course GPA map to chart data with semester info
        const performanceData = Object.entries(courseGPAMap).map(([key, data]) => ({
          course: data.course,
          semester: data.semester,
          avgGPA: Number((data.totalPoints / data.totalCredits).toFixed(2)),
        }));

        // Calculate overall average GPA - only if we have valid courses
        let avgGPA = "N/A";
        if (studentsWithGPA > 0) {
          avgGPA = (totalGPASum / studentsWithGPA).toFixed(2);
        }

        // Set pass/fail data
        const totalGrades = passedCount + failedCount;
        const passFailStats = totalGrades > 0 
          ? [
              { name: "Passed", value: Math.round((passedCount / totalGrades) * 100) },
              { name: "Failed", value: Math.round((failedCount / totalGrades) * 100) },
            ]
          : [
              { name: "Passed", value: 0 },
              { name: "Failed", value: 0 },
            ];

        setStudentPerformanceData(performanceData);
        setPassFailData(passFailStats);
        setAnalytics({
          avgGPA,
          totalStudents,
          coursesOffered,
        });
        console.log("Analytics loaded successfully:", {
          performanceData,
          passFailStats,
          avgGPA,
          totalStudents,
          coursesOffered,
        });
        setAllPerformanceData(performanceData);
        setAllPassFailData(passFailStats);
        setStudentPerformanceData(performanceData);
        setPassFailData(passFailStats);
        setLoading(false);
      } catch (err) {
        console.error("Error loading analytics:", err);
        alert("Error loading analytics: " + err.message);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Filter data based on selected semester
  useEffect(() => {
    if (selectedSemester === "all") {
      setStudentPerformanceData(allPerformanceData);
      setPassFailData(allPassFailData);
    } else {
      const filteredPerformance = allPerformanceData.filter(
        (item) => String(item.semester) === selectedSemester
      );
      const filteredPassFail = allPassFailData.filter(
        (item) => String(item.semester) === selectedSemester
      );
      setStudentPerformanceData(filteredPerformance);
      setPassFailData(filteredPassFail);
    }
  }, [selectedSemester, allPerformanceData, allPassFailData]);

  const getGradePoint = (grade) => {
    const gradePoints = {
      "A+": 4.0, A: 4.0, "A-": 3.7,
      "B+": 3.3, B: 3.0, "B-": 2.7,
      "C+": 2.3, C: 2.0, "C-": 1.7,
      "D+": 1.3, D: 1.0,
      F: 0.0,
    };
    if (!grade) return null;
    const key = String(grade).trim().toUpperCase();
    return gradePoints[key] ?? null;
  };

  const mapRSTRecord = (record, courseToSemesterMap = {}) => {
    // Debug: Log the entire record to see available fields
    console.log("🔍 Full RST Record:", record);
    
    // Handle RST data structure - grades ARE stored in the database
    const courseInfo = record.course || record.course_info || record.course_details || {};
    
    const courseName =
      courseInfo.course_title ||
      courseInfo.title ||
      courseInfo.name ||
      record.course_title ||
      record.course_name ||
      record.courseName ||
      record.course ||
      record.title ||
      "Unknown Course";

    // Extract grade - the database has it in the 'grade' column
    let grade = record.grade || null;
    
    // If still no grade, try alternative fields
    if (!grade || grade === "N/A") {
      grade =
        record.overall_grade ||
        record.final_grade ||
        record.result_grade ||
        record.letter_grade ||
        record.grade_letter ||
        record.result ||
        record.marks ||
        record.total_marks ||
        null;
    }

    // Ensure grade is a clean string
    grade = grade ? String(grade).trim() : null;

    const creditHours =
      Number(
        record.credit_hours ||
        record.creditHours ||
        record.credit ||
        courseInfo.credit_hours ||
        courseInfo.creditHours ||
        courseInfo.credit ||
        0
      ) || 0;

    // Extract semester - try from record first, then map from course name
    let semester =
      record.semester ||
      record.semester_id ||
      record.semester_number ||
      courseInfo.semester ||
      courseInfo.semester_id ||
      courseInfo.semester_number;

    // If semester not found in record, look it up from course name mapping
    if (!semester || semester === "N/A") {
      const courseKey = String(courseName).toLowerCase().trim();
      semester = courseToSemesterMap[courseKey] || "1"; // Default to semester 1 if not found
    }

    console.log(`🔍 RST Record: course="${courseName}", grade="${grade}", credits=${creditHours}, semester=${semester}`);

    return {
      courseName: String(courseName).trim(),
      grade: grade || "N/A",
      creditHours,
      semester,
    };
  };

  const calculateStudentGPA = (transcript, courseToSemesterMap = {}) => {
    let totalPoints = 0;
    let totalCredits = 0;

    transcript.forEach((record) => {
      const { grade, creditHours } = mapRSTRecord(record, courseToSemesterMap);
      const gradePoint = getGradePoint(grade);

      if (gradePoint !== null && creditHours > 0) {
        totalPoints += gradePoint * creditHours;
        totalCredits += creditHours;
      }
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];

  // ======= Function to Download Report =======
  const handleDownloadPDF = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;

    try {
      // Clone the element to avoid modifying the original
      const clonedElement = reportElement.cloneNode(true);
      
      // Create a temporary container outside the viewport
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = reportElement.offsetWidth + 'px';
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);
      
      // Walk through all elements and sanitize styles to avoid oklch colors
      const walker = document.createTreeWalker(
        clonedElement,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        // Remove potentially problematic styles and set safe fallbacks
        node.style.color = window.getComputedStyle(node).color.includes('oklch') ? '#000000' : '';
        node.style.backgroundColor = window.getComputedStyle(node).backgroundColor.includes('oklch') ? 'transparent' : '';
        node.style.borderColor = window.getComputedStyle(node).borderColor.includes('oklch') ? '#cccccc' : '';
      }
      
      // Generate canvas from the sanitized clone
      const canvas = await html2canvas(clonedElement, { 
        scale: 2,
        allowTaint: true,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Clean up temporary container
      document.body.removeChild(tempContainer);
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.text("Student Analytics Report", 14, 10);
      pdf.addImage(imgData, "PNG", 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position + 10, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("Student_Analytics_Report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-3">
            <BarChart3 className="text-blue-600" />
            {departmentName} Analytics
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Department Chair Dashboard</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ===== Analytics Content ===== */}
          <div ref={reportRef}>
            <StudentAnalyticsView
              studentPerformanceData={studentPerformanceData}
              passFailData={passFailData}
              COLORS={COLORS}
              analytics={analytics}
              selectedSemester={selectedSemester}
              onSemesterChange={setSelectedSemester}
            />
          </div>
        </>
      )}

      {/* Share Modal Removed */}
    </div>
  );
}

/* ================= Student Analytics View ================= */
function StudentAnalyticsView({ studentPerformanceData, passFailData, COLORS, analytics, selectedSemester, onSemesterChange }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <KPICard
          icon={<TrendingUp className="text-green-500" />}
          title="Average GPA"
          value={analytics.avgGPA}
        />
        <KPICard
          icon={<Users className="text-blue-500" />}
          title="Total Students"
          value={analytics.totalStudents}
        />
      </div>

      {/* Semester Filter */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filter by Semester:
        </label>
        <select
          value={selectedSemester}
          onChange={(e) => onSemesterChange(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="all">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
          <option value="7">Semester 7</option>
          <option value="8">Semester 8</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow col-span-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Average GPA by Course
          </h2>
          {studentPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Bar dataKey="avgGPA" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No course data available for selected semester
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Pass / Fail Ratio
          </h2>
          {passFailData.length > 0 && passFailData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={passFailData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label
                >
                  {passFailData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No grade data available
            </div>
          )}
        </div>
      </div>

      {/* Semester-wise Courses Table */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {selectedSemester === "all" ? "All Courses" : `Semester ${selectedSemester} Courses`}
        </h2>
        {studentPerformanceData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">#</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Course Name</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">CGPA</th>
                </tr>
              </thead>
              <tbody>
                {studentPerformanceData.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition border-b border-gray-300">
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-800 font-medium">{course.course}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-blue-600 font-semibold">{course.avgGPA?.toFixed(2) || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No courses available for {selectedSemester === "all" ? "all semesters" : `semester ${selectedSemester}`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Reusable KPI Card ================= */
function KPICard({ icon, title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4 hover:shadow-md transition">
      <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
