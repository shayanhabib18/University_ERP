import { useLocation, useNavigate } from "react-router-dom";

export default function AttendancePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const courses = state?.courses || [];
  const session = state?.session || "Unknown";

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-indigo-700">
          Attendance Information - {session}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Back
        </button>
      </div>

      {courses.map((course) => (
        <div key={course.id} className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-1">
            {course.id} - {course.name}
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {course.attendanceRecords.map((record, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-2 py-1">{record.date}</td>
                  <td className="px-2 py-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
          <div className="text-right text-sm mt-1 font-semibold text-gray-700">
            Attendance: <span className={`${
              parseFloat(course.attendance) > 85
                ? "text-green-600"
                : parseFloat(course.attendance) > 75
                ? "text-yellow-600"
                : "text-red-600"
            }`}>{course.attendance}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
