import { useState } from "react";

const mockCourses = [
  {
    id: "CS101",
    name: "Introduction to Programming",
    students: [
      { id: "S1", name: "Ali Raza" },
      { id: "S2", name: "Waleed Atta" },
      { id: "S3", name: "Usman Tariq" },
    ],
  },
  {
    id: "CS102",
    name: "Data Structures",
    students: [
      { id: "S4", name: "Faizan Malik" },
      { id: "S5", name: "Bilal Ahmed" },
    ],
  },
];

export default function Courses() {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  const selectedCourse = mockCourses.find((c) => c.id === selectedCourseId);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = () => {
    if (!date || !selectedCourseId) return alert("Date and course required");

    const key = `${selectedCourseId}_${date}`;
    setAttendanceRecords((prev) => ({
      ...prev,
      [key]: attendance,
    }));
    setAttendance({});
    alert("Attendance submitted");
  };

  const handleDownloadAttendance = () => {
    if (!selectedCourseId) return alert("Please select a course");

    const dataToDownload = Object.entries(attendanceRecords)
      .filter(([key]) => key.startsWith(selectedCourseId))
      .map(([key, record]) => {
        const recordDate = key.split("_")[1];
        return {
          date: recordDate,
          records: Object.entries(record).map(([sid, status]) => {
            const student = selectedCourse.students.find((s) => s.id === sid);
            return {
              studentId: sid,
              studentName: student?.name || "Unknown",
              status,
            };
          }),
        };
      });

    const jsonStr = JSON.stringify(dataToDownload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCourseId}_attendance.json`;
    a.click();
  };

  const filteredStudents = selectedCourse
    ? selectedCourse.students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">📚 My Courses</h1>

      {/* Course Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {mockCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => setSelectedCourseId(course.id)}
            className={`p-4 border rounded-lg cursor-pointer shadow hover:shadow-md ${
              selectedCourseId === course.id
                ? "bg-blue-100 border-blue-500"
                : "bg-white"
            }`}
          >
            <h3 className="text-lg font-semibold">{course.name}</h3>
            <p className="text-sm text-gray-600">
              Enrolled Students: {course.students.length}
            </p>
          </div>
        ))}
      </div>

      {/* Student List & Attendance */}
      {selectedCourse && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            📋 Attendance - {selectedCourse.name}
          </h2>

          {/* Date & Search */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded w-full md:w-1/3"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name"
              className="border p-2 rounded w-full md:w-1/3"
            />
          </div>

          {/* Student Attendance Table */}
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Present</th>
                <th className="p-2 border">Absent</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="p-2 border">{student.name}</td>
                  <td className="p-2 border">
                    <input
                      type="radio"
                      name={`status-${student.id}`}
                      onChange={() =>
                        handleAttendanceChange(student.id, "Present")
                      }
                      checked={attendance[student.id] === "Present"}
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="radio"
                      name={`status-${student.id}`}
                      onChange={() =>
                        handleAttendanceChange(student.id, "Absent")
                      }
                      checked={attendance[student.id] === "Absent"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Submit Button */}
          <button
            onClick={handleSubmitAttendance}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          >
            Submit Attendance
          </button>

          {/* View Previous Records */}
          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-2">
              📅 Previous Attendance Records
            </h3>
            {Object.entries(attendanceRecords)
              .filter(([key]) => key.startsWith(selectedCourseId))
              .map(([key, record]) => {
                const recordDate = key.split("_")[1];
                return (
                  <div key={key} className="mb-3 border p-4 rounded-lg">
                    <h4 className="text-sm text-gray-600 mb-1">
                      Date: {recordDate}
                    </h4>
                    <ul className="text-sm text-gray-800">
                      {Object.entries(record).map(([sid, status]) => {
                        const student = selectedCourse.students.find(
                          (s) => s.id === sid
                        );
                        return (
                          <li key={sid}>
                            {student?.name}:{" "}
                            <span
                              className={
                                status === "Present"
                                  ? "text-green-600"
                                  : "text-red-500"
                              }
                            >
                              {status}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadAttendance}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Download Attendance
          </button>
        </div>
      )}
    </div>
  );
}
