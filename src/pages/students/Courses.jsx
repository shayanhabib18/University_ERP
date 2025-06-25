import React, { useState } from 'react';

export default function Courses() {
  // Sample data for all semesters and courses
  const semesters = [
    {
      session: "Sp-2025",
      courses: [
        { 
          id: "MS 3801", 
          name: "Entrepreneurship & Technology", 
          grade: "Result Awaited",
          attendance: "100%",
          attendanceRecords: [
            { date: "Tuesday, June 10, 2025", status: "Present" },
            { date: "Thursday, June 12, 2025", status: "Present" }
          ]
        },
        { 
          id: "CS 2406", 
          name: "Information Security", 
          grade: "Result Awaited",
          attendance: "96%",
          attendanceRecords: [
            { date: "Monday, April 21, 2025", status: "Present" },
            { date: "Wednesday, April 09, 2025", status: "Present" },
            { date: "Friday, April 11, 2025", status: "Present" },
            { date: "Monday, May 12, 2025", status: "Present" },
            { date: "Wednesday, May 14, 2025", status: "Absent" },
            { date: "Friday, May 16, 2025", status: "Present" },
            { date: "Monday, June 02, 2025", status: "Present" },
            { date: "Wednesday, June 04, 2025", status: "Present" }
          ]
        },
        { 
          id: "MS 4103", 
          name: "Leadership & Team Management", 
          grade: "Result Awaited",
          attendance: "95%",
          attendanceRecords: [
            { date: "Tuesday, April 22, 2025", status: "Present" },
            { date: "Thursday, April 10, 2025", status: "Present" },
            { date: "Tuesday, May 13, 2025", status: "Present" },
            { date: "Thursday, May 15, 2025", status: "Present" },
            { date: "Tuesday, June 03, 2025", status: "Present" },
            { date: "Thursday, June 05, 2025", status: "Present" }
          ]
        }
      ],
      gpa: "Result Awaited",
      cgpa: "Result Awaited",
      standing: "Result Awaited"
    },
    {
      session: "Fa-2024",
      courses: [
        { 
          id: "CS 3401", 
          name: "Artificial Intelligence", 
          grade: "A",
          attendance: "88%",
          attendanceRecords: [
            { date: "Monday, September 15, 2024", status: "Present" },
            { date: "Wednesday, September 17, 2024", status: "Present" },
            { date: "Friday, September 19, 2024", status: "Absent" },
            { date: "Monday, October 06, 2024", status: "Present" }
          ]
        },
        { 
          id: "CS 3502", 
          name: "Compiler Design", 
          grade: "B+",
          attendance: "76%",
          attendanceRecords: [
            { date: "Tuesday, September 16, 2024", status: "Present" },
            { date: "Thursday, September 18, 2024", status: "Absent" },
            { date: "Tuesday, October 07, 2024", status: "Present" }
          ]
        }
      ],
      gpa: "3.45",
      cgpa: "3.52",
      standing: "Good"
    }
  ];

  const [activeSemester, setActiveSemester] = useState(0);
  const [showAttendancePanel, setShowAttendancePanel] = useState(false);
  const current = semesters[activeSemester];

  const handleGenerateTranscript = () => {
    // Add your transcript generation logic here
    alert('Transcript generation initiated for ' + current.session);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700">📚 Enrolled Courses</h2>
        
        {/* Semester Selector */}
        <div className="overflow-x-auto w-full sm:w-auto">
          <div className="flex gap-2 w-max min-w-full">
            {semesters.map((semester, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveSemester(index);
                  setShowAttendancePanel(false);
                }}
                className={`whitespace-nowrap px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                  activeSemester === index
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-800 hover:bg-indigo-100'
                }`}
              >
                {semester.session}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Button Group */}
      <div className="flex flex-wrap justify-end gap-3 mb-6">
        {/* View/Hide Attendance Button */}
        <button
          onClick={() => setShowAttendancePanel(!showAttendancePanel)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
            showAttendancePanel
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          {showAttendancePanel ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Hide Attendance
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              View All Attendance
            </>
          )}
        </button>

        {/* Generate Transcript Button */}
        <button
          onClick={handleGenerateTranscript}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-medium bg-green-100 text-green-700 hover:bg-green-200 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          Generate Transcript
        </button>
      </div>

      {/* Semester Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="text-xs text-indigo-600 font-medium">GPA</div>
          <div className="font-semibold">{current.gpa}</div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="text-xs text-indigo-600 font-medium">CGPA</div>
          <div className="font-semibold">{current.cgpa}</div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="text-xs text-indigo-600 font-medium">Academic Standing</div>
          <div className="font-semibold">{current.standing}</div>
        </div>
      </div>

      {/* Attendance Panel for All Courses */}
      {showAttendancePanel && (
        <div className="mb-8 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-indigo-700 mb-2">STUDENT ACADEMIC ATTENDANCE INFORMATION PANEL</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              It is student's responsibility to keep track of his/her attendance. If you find any discrepancy in your attendance records, then report the discrepancy to your Course Instructor within one week (07 days). No request will be entertained after this period.
            </p>
          </div>

          {current.courses.map((course, courseIndex) => (
            <div key={course.id} className={`mb-8 ${courseIndex !== current.courses.length - 1 ? 'pb-6 border-b border-gray-200' : ''}`}>
              <h4 className="text-md sm:text-lg font-semibold mb-3 text-gray-800">
                {course.id} - {course.name}
              </h4>
              
              <div className="overflow-x-auto mb-3">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left text-xs sm:text-sm">Date</th>
                      <th className="px-3 py-2 text-left text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.attendanceRecords.map((record, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs sm:text-sm">{record.date}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === "Present" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-right">
                <span className="text-sm text-gray-600">Overall Attendance: </span>
                <span className={`text-sm sm:text-base font-semibold ${
                  parseFloat(course.attendance) > 85 
                    ? "text-green-600" 
                    : parseFloat(course.attendance) > 75 
                      ? "text-yellow-600" 
                      : "text-red-600"
                }`}>
                  {course.attendance}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses Summary Table */}
      <div className={`overflow-x-auto ${showAttendancePanel ? 'opacity-70' : ''}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs sm:text-sm text-gray-500 uppercase border-b">
              <th className="px-3 py-2">Course Code</th>
              <th className="px-3 py-2">Course Name</th>
              <th className="px-3 py-2">Grade</th>
              <th className="px-3 py-2">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {current.courses.map((course) => (
              <tr key={course.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-3 font-medium text-indigo-600 text-xs sm:text-sm">
                  {course.id}
                </td>
                <td className="px-3 py-3 text-xs sm:text-sm">
                  {course.name}
                </td>
                <td className="px-3 py-3">
                  <span className={`text-xs sm:text-sm font-medium ${
                    course.grade === "Result Awaited" 
                      ? "text-gray-500" 
                      : "text-indigo-600"
                  }`}>
                    {course.grade}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-xs sm:text-sm font-medium ${
                    parseFloat(course.attendance) > 85 
                      ? "text-green-600" 
                      : parseFloat(course.attendance) > 75 
                        ? "text-yellow-600" 
                        : "text-red-600"
                  }`}>
                    {course.attendance}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}