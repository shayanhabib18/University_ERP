import { useState } from "react";
import { Search } from "lucide-react";

export default function CoordinatorSearch() {
  const [query, setQuery] = useState("");
  const [showStudentRecords, setShowStudentRecords] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleSearch = () => {
    console.log("Searching for:", query);
    // TODO: Replace with actual API call
  };

  // Dummy data for student records
  const studentRecords = [
    { 
      name: "Ali Khan", 
      rollNo: "U001", 
      department: "Computer Science", 
      degree: "BSCS", 
      session: "2021-2025"
    },
    { 
      name: "Sara Ahmed", 
      rollNo: "U002", 
      department: "Mathematics", 
      degree: "BSMATH", 
      session: "2020-2024"
    },
    { 
      name: "Usman Tariq", 
      rollNo: "U003", 
      department: "Physics", 
      degree: "BSPHYS", 
      session: "2022-2026"
    },
  ];

  // Academic history per semester
  const academicHistory = {
    U001: {
      "Semester 1": [
        { code: "CS101", name: "Introduction to CS", grade: "A" },
        { code: "MA101", name: "Calculus I", grade: "B+" },
      ],
      "Semester 2": [
        { code: "CS102", name: "Data Structures", grade: "A-" },
        { code: "MA102", name: "Calculus II", grade: "A" },
      ],
    },
    U002: {
      "Semester 1": [
        { code: "MA101", name: "Algebra I", grade: "B+" },
        { code: "PH101", name: "Physics I", grade: "A" },
      ],
      "Semester 2": [
        { code: "MA102", name: "Algebra II", grade: "B" },
        { code: "CS101", name: "Intro to CS", grade: "A-" },
      ],
    },
    U003: {
      "Semester 1": [
        { code: "PH101", name: "Physics I", grade: "B+" },
        { code: "CS101", name: "Intro to CS", grade: "A" },
      ],
      "Semester 2": [
        { code: "PH103", name: "Modern Physics", grade: "A-" },
        { code: "MA101", name: "Calculus I", grade: "B" },
      ],
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Search</h1>
        <p className="text-gray-500 mt-1">
          Find students, courses, and records across the university
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students, courses, transcripts..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-3 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Search size={18} /> Search
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() => setShowStudentRecords(true)}
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Student Records
          </h2>
          <p className="text-gray-500 mt-1">View previous student records</p>
          <span className="mt-2 inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            1,247
          </span>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <h2 className="text-lg font-semibold text-gray-800">Course Catalog</h2>
          <p className="text-gray-500 mt-1">Search and manage courses</p>
          <span className="mt-2 inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full">
            85
          </span>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer">
          <h2 className="text-lg font-semibold text-gray-800">Transcripts</h2>
          <p className="text-gray-500 mt-1">Search and manage transcripts</p>
          <span className="mt-2 inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            234
          </span>
        </div>
      </div>

      {/* Student Records Table */}
      {showStudentRecords && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 overflow-x-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Previous Student Records
          </h3>
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Roll No</th>
                <th className="py-2 px-3">Department</th>
                <th className="py-2 px-3">Degree</th>
                <th className="py-2 px-3">Session</th>
                <th className="py-2 px-3">Academic History</th>
              </tr>
            </thead>
            <tbody>
              {studentRecords.map((record, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 px-3">{record.name}</td>
                  <td className="py-2 px-3">{record.rollNo}</td>
                  <td className="py-2 px-3">{record.department}</td>
                  <td className="py-2 px-3">{record.degree}</td>
                  <td className="py-2 px-3">{record.session}</td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => setSelectedStudent(record.rollNo)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Show Academic History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Student Full Academic History */}
      {selectedStudent && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Academic History of{" "}
            {studentRecords.find((s) => s.rollNo === selectedStudent)?.name}
          </h3>
          {Object.entries(academicHistory[selectedStudent]).map(
            ([semester, courses], idx) => (
              <div key={idx} className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">{semester}</h4>
                <table className="w-full text-left border-collapse mb-2">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 px-3">Course Code</th>
                      <th className="py-2 px-3">Course Name</th>
                      <th className="py-2 px-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 px-3">{c.code}</td>
                        <td className="py-2 px-3">{c.name}</td>
                        <td className="py-2 px-3">{c.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={() => setSelectedStudent(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
