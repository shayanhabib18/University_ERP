import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Courses() {
  const semesters = [
    {
      session: "Sp-2025",
      courses: [
        {
          id: "MS 3801",
          name: "Entrepreneurship & Technology",
          grade: "Result Awaited",
          attendance: "87%",
          attendanceRecords: [
            { date: "Thursday, April 24, 2025", status: "Absent" },
            { date: "Tuesday, April 08, 2025", status: "Present" },
            { date: "Thursday, May 08, 2025", status: "Present" },
            { date: "Thursday, February 27, 2025", status: "Present" },
            { date: "Thursday, March 06, 2025", status: "Present" },
            { date: "Thursday, March 20, 2025", status: "Present" },
            { date: "Monday, March 24, 2025", status: "Present" },
            { date: "Thursday, March 27, 2025", status: "Present" },
            { date: "Thursday, May 15, 2025", status: "Absent" },
            { date: "Monday, May 26, 2025", status: "Present" },
            { date: "Thursday, May 29, 2025", status: "Present" },
            { date: "Thursday, April 17, 2025", status: "Present" },
            { date: "Tuesday, June 10, 2025", status: "Present" },
            { date: "Thursday, June 12, 2025", status: "Present" }
          ]
        },
        {
          id: "CS 2406",
          name: "Information Security",
          grade: "Result Awaited",
          attendance: "92%",
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
  const current = semesters[activeSemester];
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700">📚 Enrolled Courses</h2>
        <div className="overflow-x-auto w-full sm:w-auto">
          <div className="flex gap-2 w-max min-w-full">
            {semesters.map((semester, index) => (
              <button
                key={index}
                onClick={() => setActiveSemester(index)}
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

      <div className="overflow-x-auto">
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
                <td className="px-3 py-3 text-indigo-600 text-xs sm:text-sm font-medium">{course.id}</td>
                <td className="px-3 py-3 text-xs sm:text-sm">{course.name}</td>
                <td className="px-3 py-3">
                  <span className={`text-xs sm:text-sm font-medium ${
                    course.grade === "Result Awaited" ? "text-gray-500" : "text-indigo-600"
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
