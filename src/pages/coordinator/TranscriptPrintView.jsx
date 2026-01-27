import React from "react";

export default function TranscriptPrintView({ studentData, courses }) {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    if (phone.startsWith("+92")) return phone;
    return "+92 " + phone;
  };

  // Group courses by semester (prioritize explicit semester field, fall back to rst_data)
  const groupCoursesBySemester = () => {
    const grouped = {};

    courses.forEach((course) => {
      let semesterValue = course.semester;

      // Fallback: extract semester from rst_data if present
      if (!semesterValue && course.rst_data) {
        try {
          const rstData = typeof course.rst_data === "string"
            ? JSON.parse(course.rst_data)
            : course.rst_data;
          if (rstData?.semester) {
            semesterValue = rstData.semester;
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      const semesterLabel = semesterValue
        ? `Semester ${semesterValue}`
        : "Semester Unknown";

      if (!grouped[semesterLabel]) {
        grouped[semesterLabel] = [];
      }
      grouped[semesterLabel].push(course);
    });

    return grouped;
  };

  const calculateTotalCredits = () => {
    return courses.reduce((total, course) => total + (course.credit_hours || 0), 0);
  };

  const calculateGPA = () => {
    const gradePoints = {
      "A": 4.0,
      "A+": 4.0,
      "A-": 3.7,
      "B": 3.0,
      "B+": 3.3,
      "B-": 2.7,
      "C": 2.0,
      "C+": 2.3,
      "C-": 1.7,
      "D": 1.0,
      "F": 0.0,
    };

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
      const points = gradePoints[course.grade] || 0;
      const credits = course.credit_hours || 0;
      totalPoints += points * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A";
  };

  const groupedCourses = groupCoursesBySemester();
  const semesterOrder = Object.keys(groupedCourses).sort((a, b) => {
    const aNum = Number(a.replace(/[^0-9]/g, ""));
    const bNum = Number(b.replace(/[^0-9]/g, ""));
    const aIsNum = !Number.isNaN(aNum);
    const bIsNum = !Number.isNaN(bNum);
    if (aIsNum && bIsNum && aNum !== bNum) return bNum - aNum; // descending
    if (aIsNum && !bIsNum) return -1;
    if (!aIsNum && bIsNum) return 1;
    return b.localeCompare(a);
  });

  return (
    <div id="transcript-print-view" className="bg-white p-8 font-mono text-sm leading-relaxed max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <div className="text-2xl font-bold">STUDENT TRANSCRIPT</div>
        <div className="mt-2 text-xs text-gray-600">
          University Information System - Official Academic Record
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="mb-8">
        <div className="font-bold text-lg mb-2 border-b border-gray-400 pb-2">
          PERSONAL INFORMATION
        </div>
        <div className="border border-gray-300 p-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold">Name:</span>{" "}
              {studentData?.full_name || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Roll Number:</span>{" "}
              {studentData?.roll_number || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {studentData?.personal_email || studentData?.email || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Phone:</span>{" "}
              {formatPhone(studentData?.student_phone)}
            </div>
            <div>
              <span className="font-semibold">Date of Birth:</span>{" "}
              {formatDate(studentData?.date_of_birth)}
            </div>
            <div>
              <span className="font-semibold">CNIC:</span>{" "}
              {studentData?.cnic || "N/A"}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Father's Name:</span>{" "}
              {studentData?.father_name || "N/A"}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Address:</span>{" "}
              {studentData?.address || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Academic History Section */}
      <div className="mb-8">
        <div className="font-bold text-lg mb-2 border-b border-gray-400 pb-2">
          ACADEMIC HISTORY
        </div>
        
        {semesterOrder.length > 0 ? (
          semesterOrder.map((semester) => (
            <div key={semester} className="mb-6">
              <div className="font-bold text-base mb-3 py-2 bg-gray-100">
                {semester}
              </div>
              <div className="border border-gray-300 mb-4 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-300">
                      <th className="text-left p-2 w-16">Code</th>
                      <th className="text-left p-2 flex-grow">Course Name</th>
                      <th className="text-center p-2 w-12">Grade</th>
                      <th className="text-right p-2 w-16">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedCourses[semester].map((course) => (
                      <tr
                        key={course.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-2 font-mono">{course.course_code}</td>
                        <td className="p-2">{course.course_name}</td>
                        <td className="text-center p-2 font-semibold">
                          {course.grade}
                        </td>
                        <td className="text-right p-2">{course.credit_hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-gray-300 p-4 text-center text-gray-500">
            No course records found
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <div className="font-bold text-lg mb-2 border-b border-gray-400 pb-2">
          SUMMARY
        </div>
        <div className="border border-gray-300 p-4">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-semibold">Total Credits:</span>{" "}
              {calculateTotalCredits()}
            </div>
            <div>
              <span className="font-semibold">GPA:</span> {calculateGPA()}
            </div>
            <div>
              <span className="font-semibold">Generated on:</span>{" "}
              {formatDate(new Date())}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t-2 border-black pt-4 mt-8 text-xs text-gray-600">
        <p>
          This is an official transcript issued by the University. It is valid
          only with the official seal and signature.
        </p>
      </div>
    </div>
  );
}
