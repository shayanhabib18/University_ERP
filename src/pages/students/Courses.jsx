import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentsAPI } from '../../services/studentAPI';

export default function Courses() {
  const [enrollments, setEnrollments] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSemester, setActiveSemester] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const navigate = useNavigate();

  // Function to get semester name from joining info
  const getSemesterName = (joiningSession, joiningDate) => {
    let seasonName = "";
    let year = new Date().getFullYear();

    // Try to extract from joiningSession (format: "Sp-2025", "Fa-2024", etc.)
    if (joiningSession) {
      const match = joiningSession.match(/([A-Za-z]+)-(\d{4})/);
      if (match) {
        const seasonCode = match[1].toLowerCase();
        year = match[2];
        
        const seasonMap = {
          'sp': 'Spring',
          'fa': 'Fall',
          'su': 'Summer'
        };
        
        seasonName = seasonMap[seasonCode] || joiningSession;
        return `${seasonName} ${year}`;
      }
    }

    // Fallback: Extract year from joining_date
    if (joiningDate) {
      const dateObj = new Date(joiningDate);
      year = dateObj.getFullYear();
      
      // Try to determine season from month
      const month = dateObj.getMonth();
      if (month >= 0 && month < 5) {
        seasonName = "Spring";
      } else if (month >= 5 && month < 9) {
        seasonName = "Summer";
      } else {
        seasonName = "Fall";
      }
      
      return `${seasonName} ${year}`;
    }

    return "Current Session";
  };

  const handleAutoEnroll = async () => {
    try {
      setEnrolling(true);
      
      // Get student info from localStorage
      const studentInfo = localStorage.getItem("student_info");
      if (!studentInfo) {
        throw new Error("Student information not found. Please log in again.");
      }

      const student = JSON.parse(studentInfo);
      const studentId = student.id;

      if (!studentId) {
        throw new Error("Student ID not found.");
      }

      // Call auto-enroll endpoint
      const response = await fetch(`http://localhost:5000/students/enrollments/auto-enroll/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to enroll in courses');
      }

      // Refresh enrollments
      const data = await enrollmentsAPI.getByStudent(studentId);
      
      // Group enrollments by semester
      const grouped = {};
      
      if (data && Array.isArray(data)) {
        data.forEach((enrollment) => {
          const semester = enrollment.semester || 1;
          const academicYear = enrollment.academic_year || "2025-2026";
          
          if (!grouped[semester]) {
            grouped[semester] = {
              semester: semester,
              session: academicYear,
              courses: [],
              gpa: "Result Awaited",
              cgpa: "Result Awaited",
              standing: "Result Awaited"
            };
          }

          grouped[semester].courses.push({
            id: enrollment.course_id,
            courseCode: enrollment.course_code || `COURSE-${enrollment.course_id}`,
            name: enrollment.course_name || "Course Name",
            creditHours: enrollment.credit_hours || 3,
            grade: enrollment.grade || "Result Awaited",
            attendance: enrollment.attendance || "N/A",
            status: enrollment.status || "ongoing",
            attendanceRecords: []
          });
        });
      }

      const semestersArray = Object.values(grouped).sort((a, b) => b.semester - a.semester);
      setEnrollments(semestersArray);
      setActiveSemester(0);
      setError(null);
      
    } catch (err) {
      console.error("Failed to auto-enroll:", err);
      setError(err.message || "Failed to enroll in courses");
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get student ID from localStorage to use as reference
        const studentInfoStr = localStorage.getItem("student_info");
        if (!studentInfoStr) {
          throw new Error("Student information not found. Please log in again.");
        }

        const studentInfoLocal = JSON.parse(studentInfoStr);
        const studentId = studentInfoLocal.id;

        if (!studentId) {
          throw new Error("Student ID not found.");
        }

        // Fetch fresh student data from database
        console.log("Fetching fresh student data from database...");
        const studentResponse = await fetch(`http://localhost:5000/students/${studentId}`);
        
        if (!studentResponse.ok) {
          throw new Error("Failed to fetch student data from database");
        }
        
        const freshStudentData = await studentResponse.json();
        console.log("Fresh Student Data from Database:", freshStudentData);
        
        // Update localStorage with fresh data
        localStorage.setItem("student_info", JSON.stringify(freshStudentData));
        setStudentInfo(freshStudentData);

        // Fetch enrollments
        const data = await enrollmentsAPI.getByStudent(studentId);
        
        // Group enrollments by semester
        const grouped = {};
        
        if (data && Array.isArray(data)) {
          data.forEach((enrollment) => {
            const semester = enrollment.semester || 1;
            const academicYear = enrollment.academic_year || "2025-2026";
            
            if (!grouped[semester]) {
              grouped[semester] = {
                semester: semester,
                session: academicYear,
                courses: [],
                gpa: "Result Awaited",
                cgpa: "Result Awaited",
                standing: "Result Awaited"
              };
            }

            grouped[semester].courses.push({
              id: enrollment.course_id,
              courseCode: enrollment.course_code || `COURSE-${enrollment.course_id}`,
              name: enrollment.course_name || "Course Name",
              creditHours: enrollment.credit_hours || 3,
              grade: enrollment.grade || "Result Awaited",
              attendance: enrollment.attendance || "N/A",
              status: enrollment.status || "ongoing",
              attendanceRecords: []
            });
          });
        }

        // Fetch academic records for GPA and CGPA data
        const academicResponse = await fetch(`http://localhost:5000/students/academic-records/student/${studentId}`);
        const academicRecords = academicResponse.ok ? await academicResponse.json() : [];
        
        // Merge academic records with enrollments
        const semestersArray = Object.values(grouped).sort((a, b) => b.semester - a.semester);
        
        semestersArray.forEach((semester) => {
          const academicRecord = academicRecords.find(record => record.semester === semester.semester);
          if (academicRecord) {
            semester.gpa = academicRecord.gpa || "Result Awaited";
            semester.cgpa = academicRecord.overall_grade || "Result Awaited";
            semester.standing = academicRecord.remarks || "Result Awaited";
          }
        });
        
        setEnrollments(semestersArray);
        setActiveSemester(0);
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
        setError(err.message || "Failed to load course enrollments");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading your courses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Courses</h3>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-4">📚 Enrolled Courses</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">No courses enrolled yet.</p>
          <p className="text-sm text-gray-500 mb-6">Click the button below to enroll in your first semester courses.</p>
          <button
            onClick={handleAutoEnroll}
            disabled={enrolling}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              enrolling 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {enrolling ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enrolling...
              </span>
            ) : (
              'Enroll in First Semester Courses'
            )}
          </button>
        </div>
      </div>
    );
  }

  const current = enrollments[activeSemester] || { courses: [], session: "N/A", gpa: "N/A", cgpa: "N/A", standing: "N/A" };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700">📚 Enrolled Courses</h2>

      </div>

      {/* Student Summary Cards */}
      {studentInfo && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Joining Session Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
            <p className="text-xs font-semibold uppercase opacity-80">Joining Session</p>
            <p className="text-lg font-bold mt-2">
              {getSemesterName(studentInfo.joining_session, studentInfo.joining_date)}
            </p>
          </div>

          {/* Current Semester Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
            <p className="text-xs font-semibold uppercase opacity-80">Current Semester</p>
            <p className="text-lg font-bold mt-2">Semester {current.semester || 1}</p>
          </div>

          {/* Current Semester Credit Hours Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
            <p className="text-xs font-semibold uppercase opacity-80">Cr.Hr - Current</p>
            <p className="text-lg font-bold mt-2">
              {current.courses?.length > 0 
                ? current.courses.reduce((sum, c) => sum + (c.creditHours || 0), 0)
                : 0
              }
            </p>
            <p className="text-xs opacity-75 mt-1">{current.courses?.length || 0} courses</p>
          </div>

          {/* Total Credit Hours Completed Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg">
            <p className="text-xs font-semibold uppercase opacity-80">Total Cr.Hr Completed</p>
            <p className="text-lg font-bold mt-2">
              {enrollments.slice(1).reduce((total, sem) => {
                return total + (sem.courses?.reduce((sum, c) => sum + (c.creditHours || 0), 0) || 0);
              }, 0)}
            </p>
            <p className="text-xs opacity-75 mt-1">{enrollments.slice(1).length} semesters</p>
          </div>

          {/* Navigate Dropdown Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
            <p className="text-xs font-semibold uppercase opacity-80 mb-3">Navigate</p>
            {enrollments.length > 1 ? (
              <select
                value={activeSemester}
                onChange={(e) => setActiveSemester(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-white text-gray-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {enrollments.map((semester, index) => (
                  <option key={index} value={index}>
                    Semester {semester.semester}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm opacity-90">Only 1 semester available</p>
            )}
          </div>
        </div>
      )}

      {current.courses.length > 0 && (
        <div className="flex flex-wrap justify-end gap-3 mb-6">
          <button
            onClick={() =>
              navigate("/attendance", {
                state: { courses: current.courses, session: current.session },
              })
            }
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
          >
            View All Attendance
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="text-xs text-indigo-600 font-medium">Enrolled Courses</div>
          <div className="font-semibold text-lg">{current.courses?.length || 0}</div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="text-xs text-indigo-600 font-medium">GPA</div>
          <div className="font-semibold text-lg">{current.gpa}</div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="text-xs text-indigo-600 font-medium">CGPA</div>
          <div className="font-semibold text-lg">{current.cgpa}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs sm:text-sm text-gray-500 uppercase border-b">
              <th className="px-3 py-2">Course Code</th>
              <th className="px-3 py-2">Course Name</th>
              <th className="px-3 py-2">Credit Hours</th>
              <th className="px-3 py-2">Grade</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {current.courses.length > 0 ? (
              current.courses.map((course, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-3 text-indigo-600 text-xs sm:text-sm font-medium">
                    {course.courseCode}
                  </td>
                  <td className="px-3 py-3 text-xs sm:text-sm">{course.name}</td>
                  <td className="px-3 py-3 text-xs sm:text-sm">{course.creditHours}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs sm:text-sm font-medium ${
                      course.grade === "Result Awaited" || !course.grade ? "text-gray-500" : "text-indigo-600"
                    }`}>
                      {course.grade || "Result Awaited"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === "ongoing" 
                        ? "bg-green-100 text-green-700"
                        : course.status === "dropped"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {course.status || "ongoing"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => navigate(`/course-result/${course.id}`, {
                        state: { course, semester: current.semester }
                      })}
                      className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-medium hover:underline"
                    >
                      View Result
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-3 py-6 text-center text-gray-500">
                  No courses enrolled for this semester
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
