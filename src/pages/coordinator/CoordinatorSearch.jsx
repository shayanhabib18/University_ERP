import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

export default function CoordinatorSearch() {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("students");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTranscriptStudent, setSelectedTranscriptStudent] = useState(null);

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

  const coursesByDegree = {
    BSCS: [
      { code: "CS101", name: "Introduction to CS", creditHours: 3, semester: 1 },
      { code: "CS102", name: "Data Structures", creditHours: 4, semester: 2 },
      { code: "CS205", name: "Database Systems", creditHours: 3, semester: 4 },
      { code: "CS310", name: "Operating Systems", creditHours: 4, semester: 5 },
    ],
    BSMATH: [
      { code: "MA101", name: "Calculus I", creditHours: 3, semester: 1 },
      { code: "MA202", name: "Linear Algebra", creditHours: 3, semester: 3 },
      { code: "MA305", name: "Real Analysis", creditHours: 3, semester: 5 },
      { code: "MA410", name: "Complex Variables", creditHours: 3, semester: 7 },
    ],
    BSPHYS: [
      { code: "PH101", name: "Physics I", creditHours: 4, semester: 1 },
      { code: "PH210", name: "Electromagnetism", creditHours: 3, semester: 4 },
      { code: "PH320", name: "Quantum Mechanics", creditHours: 3, semester: 6 },
      { code: "PH415", name: "Solid State Physics", creditHours: 3, semester: 7 },
    ],
  };

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

  const transcriptsByDepartment = useMemo(() => {
    return studentRecords.reduce((acc, record) => {
      if (!acc[record.department]) acc[record.department] = [];
      acc[record.department].push({
        ...record,
        history: academicHistory[record.rollNo] || {},
      });
      return acc;
    }, {});
  }, [studentRecords, academicHistory]);

  const degreeOptions = Object.keys(coursesByDegree);
  const departmentOptions = Object.keys(transcriptsByDepartment);

  useEffect(() => {
    if (!selectedDepartment && departmentOptions.length) {
      setSelectedDepartment(departmentOptions[0]);
    }
  }, [selectedDepartment, departmentOptions]);

  useEffect(() => {
    if (activeSection !== "transcripts") return;
    if (!selectedDepartment) {
      setSelectedTranscriptStudent(null);
      return;
    }
    const firstStudent =
      transcriptsByDepartment[selectedDepartment]?.[0]?.rollNo ?? null;
    setSelectedTranscriptStudent(firstStudent);
  }, [activeSection, selectedDepartment, transcriptsByDepartment]);

  const sectionCards = [
    {
      key: "students",
      title: "Student Records",
      description: "View previous student records",
      badge: studentRecords.length,
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      key: "courses",
      title: "Course Catalog",
      description: "Browse degree-wise offerings",
      badge: degreeOptions.length,
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      key: "transcripts",
      title: "Transcripts",
      description: "View transcripts department-wise",
      badge: departmentOptions.length,
      badgeColor: "bg-purple-100 text-purple-700",
    },
  ];

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
        {sectionCards.map((card) => (
          <button
            key={card.key}
            onClick={() => setActiveSection(card.key)}
            className={`p-6 rounded-xl shadow transition text-left border ${
              activeSection === card.key
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-transparent hover:shadow-lg"
            }`}
          >
            <h2 className="text-lg font-semibold">
              {card.title}
            </h2>
            <p className={`mt-1 text-sm ${activeSection === card.key ? "text-indigo-100" : "text-gray-500"}`}>
              {card.description}
            </p>
            <span
              className={`mt-2 inline-block px-2 py-1 rounded-full text-sm ${
                activeSection === card.key ? "bg-white/20 text-white" : card.badgeColor
              }`}
            >
              {card.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Student Records Table */}
      {activeSection === "students" && (
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

      {/* Course Catalog */}
      {activeSection === "courses" && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Degree-wise Course Catalog</h3>
            <p className="text-sm text-gray-500">
              Inspect each program’s offerings semester-by-semester.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {degreeOptions.map((degree) => {
              const courses = coursesByDegree[degree] || [];
              const semesterGroups = courses.reduce((acc, course) => {
                if (!acc[course.semester]) acc[course.semester] = [];
                acc[course.semester].push(course);
                return acc;
              }, {});
              const semesterOrder = Object.keys(semesterGroups)
                .map((num) => Number(num))
                .sort((a, b) => a - b);

              return (
                <div
                  key={degree}
                  className="border border-gray-100 rounded-2xl p-5 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Degree</p>
                      <h4 className="text-lg font-semibold text-gray-800">{degree}</h4>
                    </div>
                    <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                      {courses.length} courses
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[26rem] overflow-auto pr-1">
                    {semesterOrder.map((semester) => (
                      <div key={semester} className="border border-gray-100 rounded-xl p-3 bg-white/80">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">
                            Semester {semester}
                          </p>
                          <span className="text-xs text-gray-500">
                            {semesterGroups[semester].length} offering(s)
                          </span>
                        </div>
                        <ul className="mt-2 space-y-2">
                          {semesterGroups[semester].map((course) => (
                            <li
                              key={course.code}
                              className="flex items-center justify-between text-sm text-gray-600 border border-gray-100 rounded-lg px-3 py-2 bg-white"
                            >
                              <div>
                                <p className="font-semibold text-gray-800">{course.code}</p>
                                <p className="text-xs text-gray-500">{course.name}</p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {course.creditHours} CH
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Department-wise Transcripts */}
      {activeSection === "transcripts" && selectedDepartment && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Department Transcripts</h3>
              <p className="text-sm text-gray-500">
                Quickly check student academic history filtered by department.
              </p>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {transcriptsByDepartment[selectedDepartment]?.map((student) => (
              <button
                key={student.rollNo}
                onClick={() => setSelectedTranscriptStudent(student.rollNo)}
                className={`w-full text-left border rounded-2xl p-4 transition ${
                  selectedTranscriptStudent === student.rollNo
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-100 hover:border-indigo-200"
                }`}
              >
                <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                <p className="text-xs text-gray-500">{student.degree} · {student.session}</p>
              </button>
            ))}
          </div>

          {selectedTranscriptStudent && (
            <div className="mt-6 border border-gray-100 rounded-2xl p-6 shadow-sm">
              {transcriptsByDepartment[selectedDepartment]
                ?.filter((student) => student.rollNo === selectedTranscriptStudent)
                .map((student) => (
                  <div key={student.rollNo}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {student.name} ({student.rollNo})
                        </h4>
                        <p className="text-sm text-gray-500">
                          {student.degree} · {student.department}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedTranscriptStudent(null)}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500 transition"
                      >
                        Close
                      </button>
                    </div>
                    {Object.entries(student.history).map(([semester, courses]) => (
                      <div key={semester} className="mb-4">
                        <h5 className="font-semibold text-gray-700 mb-2">{semester}</h5>
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
                    ))}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
