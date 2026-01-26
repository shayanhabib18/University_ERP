import { useState, useEffect } from "react";
import { FileText, Download, Eye, Search, Loader } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function ChairTranscripts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentName, setDepartmentName] = useState("N/A");

  // Fetch students from department on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("facultyToken");

        if (!token) {
          setError("No authentication token found. Please login again.");
          setLoading(false);
          return;
        }

        // Get HOD profile to get department_id
        console.log("📡 Fetching HOD profile...");
        const profileRes = await fetch("http://localhost:5000/faculties/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) {
          const errText = await profileRes.text();
          console.error("❌ Profile fetch failed:", profileRes.statusText, errText);
          setError(`Failed to fetch profile: ${profileRes.statusText}`);
          setLoading(false);
          return;
        }

        const profile = await profileRes.json();
        console.log("✅ Profile fetched:", profile.name);
        const departmentId = profile.department_id;

        // Fetch department name for display
        console.log("📡 Fetching department details for:", departmentId);
        let fetchedDeptName = "N/A";
        try {
          const deptRes = await fetch(
            `http://localhost:5000/departments/${departmentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("📊 Department response status:", deptRes.status);
          
          if (deptRes.ok) {
            const dept = await deptRes.json();
            console.log("✅ Department data:", dept);
            fetchedDeptName = dept?.name || dept?.department_name || dept?.title || "N/A";
            console.log("✅ Department name extracted:", fetchedDeptName);
            setDepartmentName(fetchedDeptName);
          } else {
            const errText = await deptRes.text();
            console.error("❌ Department fetch failed:", deptRes.status, errText);
          }
        } catch (deptErr) {
          console.error("❌ Department fetch error:", deptErr);
        }

        // Get all students in department
        console.log("📡 Fetching students for department:", departmentId);
        const studentsRes = await fetch(
          `http://localhost:5000/students/department/${departmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!studentsRes.ok) {
          const errText = await studentsRes.text();
          console.error("❌ Students fetch failed:", studentsRes.statusText, errText);
          setError(`Failed to fetch students: ${studentsRes.statusText}`);
          setLoading(false);
          return;
        }

        let studentsData = await studentsRes.json();
        console.log(`✅ Found ${studentsData.length} students`);

        if (!Array.isArray(studentsData)) {
          studentsData = [];
        }

        // Fetch academic records for each student
        const studentsWithTranscripts = await Promise.all(
          studentsData.map(async (student) => {
            try {
              const studentName = student.full_name || student.name || "Unknown";
              console.log(`📚 Fetching courses for ${studentName}...`);
              const coursesRes = await fetch(
                `http://localhost:5000/students/${student.id}/courses`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              let courseData = [];
              let gpa = 0;

              if (coursesRes.ok) {
                const courses = await coursesRes.json();
                courseData = Array.isArray(courses) ? courses : [];
                
                // Fetch RST data (grades) for each course
                console.log(`📊 Fetching RST/grades for ${studentName}...`);
                const courseDataWithGrades = await Promise.all(
                  courseData.map(async (course) => {
                    try {
                      const rstRes = await fetch(
                        `http://localhost:5000/rst/student/${student.id}/course/${course.course_id || course.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      
                      if (rstRes.ok) {
                        const rst = await rstRes.json();
                        return {
                          ...course,
                          grade: rst.grade || "N/A",
                          approval_status: rst.approval_status || "N/A",
                        };
                      }
                      return { ...course, grade: "N/A", approval_status: "N/A" };
                    } catch (err) {
                      console.warn(`Failed to fetch RST for course ${course.course_id}:`, err);
                      return { ...course, grade: "N/A", approval_status: "N/A" };
                    }
                  })
                );

                courseData = courseDataWithGrades;
                
                // Calculate GPA if grades are available
                if (courseData.length > 0) {
                  const gradePoints = {
                    A: 4.0,
                    "A-": 3.7,
                    "B+": 3.3,
                    B: 3.0,
                    "B-": 2.7,
                    "C+": 2.3,
                    C: 2.0,
                    "C-": 1.7,
                    D: 1.0,
                    F: 0.0,
                  };
                  const validGrades = courseData
                    .filter((c) => c.grade && c.grade !== "N/A" && gradePoints[c.grade] !== undefined)
                    .map((c) => ({
                      grade: c.grade,
                      creditHours: c.credit_hours || 3,
                    }));

                  if (validGrades.length > 0) {
                    const totalPoints = validGrades.reduce((sum, c) => {
                      const points = gradePoints[c.grade] || 0;
                      return sum + points * (c.creditHours || 3);
                    }, 0);
                    const totalCredits = validGrades.reduce(
                      (sum, c) => sum + (c.creditHours || 3),
                      0
                    );
                    gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
                  }
                }
              }

              return {
                ...student,
                name: student.full_name || student.name || "Unknown",
                rollNo: student.roll_number || "N/A",
                transcript: courseData.map((c) => {
                  return {
                    course: c.course_name || c.course_code || "Unknown Course",
                    code: c.course_code || "",
                    grade: c.grade || "N/A",
                    creditHours: c.credit_hours || 3,
                    semester: c.semester || "N/A",
                    academicYear: c.academic_year || "",
                    approvalStatus: c.approval_status || "N/A",
                  };
                }),
                gpa: gpa || 0,
                email: student.personal_email || student.email || "N/A",
                phone: student.student_phone || student.mobile || "N/A",
                dob: student.date_of_birth || "N/A",
                cnic: student.cnic || "N/A",
                fatherName: student.father_name || "N/A",
                address: student.permanent_address || student.address || "N/A",
                departmentName:
                  fetchedDeptName ||
                  student.department_name ||
                  student.department ||
                  "N/A",
              };
            } catch (err) {
              const studentName = student.full_name || student.name || "Unknown";
              console.error(`Error fetching courses for ${studentName}:`, err);
              return {
                ...student,
                name: student.full_name || student.name || "Unknown",
                rollNo: student.roll_number || "N/A",
                transcript: [],
                gpa: 0,
                email: student.personal_email || student.email || "N/A",
                phone: student.student_phone || student.mobile || "N/A",
                dob: student.date_of_birth || "N/A",
                cnic: student.cnic || "N/A",
                fatherName: student.father_name || "N/A",
                address: student.permanent_address || student.address || "N/A",
                departmentName:
                  fetchedDeptName ||
                  student.department_name ||
                  student.department ||
                  "N/A",
              };
            }
          })
        );

        setStudents(studentsWithTranscripts);
        console.log("✅ All students loaded with transcripts");
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search input
  const filteredStudents = students.filter(
    (student) =>
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PDF Generation Function
  const generatePDF = (student) => {
    try {
      console.log("🔄 Generating PDF for student:", student.name);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let y = 18;

      // Use monospaced font for aligned columns
      doc.setFont("courier", "normal");
      const line = (text = "") => {
        doc.text(text, margin, y, { maxWidth: pageWidth - margin * 2 });
        y += 7;
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 18;
        }
      };

      const sep = (char = "=", len = 60) => char.repeat(len);

      // Header
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      line(sep("="));
      line("STUDENT TRANSCRIPT");
      line(sep("="));
      line("");

      // Personal Information
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      line("PERSONAL INFORMATION");
      doc.setFont(undefined, "normal");
      line(sep("-"));
      line(`Name: ${student.name || "N/A"}`);
      line(`Email: ${student.email || "N/A"}`);
      line(`Phone: ${student.phone || "N/A"}`);
      line(`Date of Birth: ${student.dob || "N/A"}`);
      line(`CNIC: ${student.cnic || "N/A"}`);
      line(`Father's Name: ${student.fatherName || "N/A"}`);
      line(`Address: ${student.address || "N/A"}`);
      line(`Roll No: ${student.rollNo || "N/A"}`);
      line(`Department: ${student.departmentName || "N/A"}`);
      line("");

      // Academic History
      doc.setFont(undefined, "bold");
      line("ACADEMIC HISTORY");
      doc.setFont(undefined, "normal");
      line(sep("-"));

      const transcript = Array.isArray(student.transcript) ? student.transcript : [];
      const grouped = transcript.reduce((acc, item) => {
        const semKey = item.semester ?? "N/A";
        if (!acc[semKey]) acc[semKey] = [];
        acc[semKey].push(item);
        return acc;
      }, {});

      const sortedSemesters = Object.keys(grouped).sort((a, b) => {
        const na = Number(a);
        const nb = Number(b);
        if (Number.isNaN(na) || Number.isNaN(nb)) return a > b ? -1 : 1;
        return nb - na; // descending
      });

      let totalCredits = 0;

      if (sortedSemesters.length === 0) {
        line("No courses enrolled yet.");
      } else {
        sortedSemesters.forEach((sem) => {
          line("");
          doc.setFont(undefined, "bold");
          line(`Semester ${sem}`);
          doc.setFont(undefined, "normal");
          line(sep("-"));

          grouped[sem].forEach((c) => {
            const code = (c.code || "").padEnd(8, " ");
            const title = (c.course || "Unknown").padEnd(32, " ");
            const grade = (c.grade || "N/A").padEnd(4, " ");
            const credits = `${c.creditHours || 0} Credits`;
            totalCredits += c.creditHours || 0;
            line(`${code} | ${title} | ${grade} | ${credits}`);
          });
        });
      }

      line("");
      line(sep("="));
      line("SUMMARY");
      line(sep("="));
      line(`Total Credits: ${totalCredits}`);
      line(`CGPA: ${student.gpa || 0}`);
      line(`Generated on: ${new Date().toLocaleDateString()}`);

      // Save PDF
      const filename = `${student.rollNo || student.id}_Transcript_${new Date().getTime()}.pdf`;
      doc.save(filename);
      console.log("✅ PDF generated:", filename);
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      console.error("❌ Error stack:", err.stack);
      alert(`Error generating PDF: ${err.message}`);
    }
  };

  const buildTranscriptText = (student) => {
    const lines = [];
    const sep = (char = "=", len = 40) => char.repeat(len);
    const dashSep = (len = 40) => "-".repeat(len);

    lines.push(sep());
    lines.push("STUDENT TRANSCRIPT");
    lines.push(sep());
    lines.push("");

    lines.push("PERSONAL INFORMATION");
    lines.push(dashSep());
    lines.push(`Name: ${student.name || "N/A"}`);
    lines.push(`Email: ${student.email || "N/A"}`);
    lines.push(`Phone: ${student.phone || "N/A"}`);
    lines.push(`Date of Birth: ${student.dob || "N/A"}`);
    lines.push(`CNIC: ${student.cnic || "N/A"}`);
    lines.push(`Father's Name: ${student.fatherName || "N/A"}`);
    lines.push(`Address: ${student.address || "N/A"}`);
    lines.push(`Roll No: ${student.rollNo || "N/A"}`);
    lines.push(`Department: ${student.departmentName || "N/A"}`);
    lines.push(" ");

    lines.push("ACADEMIC HISTORY");
    lines.push(dashSep());
    lines.push("");

    const transcript = Array.isArray(student.transcript) ? student.transcript : [];
    const grouped = transcript.reduce((acc, item) => {
      const key = item.semester ?? "N/A";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const sortedSemesters = Object.keys(grouped).sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (Number.isNaN(na) || Number.isNaN(nb)) return a > b ? -1 : 1;
      return nb - na;
    });

    let totalCredits = 0;

    if (sortedSemesters.length === 0) {
      lines.push("No courses enrolled yet.");
    } else {
      sortedSemesters.forEach((sem) => {
        lines.push(`Semester ${sem}`);
        lines.push(dashSep());
        grouped[sem].forEach((c) => {
          const code = (c.code || "").padEnd(8, " ");
          const title = (c.course || "Unknown Course").padEnd(32, " ");
          const grade = (c.grade || "N/A").padEnd(4, " ");
          const credits = `${c.creditHours || 0} Credits`;
          totalCredits += c.creditHours || 0;
          lines.push(`${code} | ${title} | ${grade} | ${credits}`);
        });
        lines.push("");
      });
    }

    lines.push(sep());
    lines.push("SUMMARY");
    lines.push(sep());
    lines.push(`Total Credits: ${totalCredits}`);
    lines.push(`Generated on: ${new Date().toLocaleDateString()}`);

    return lines.join("\n");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <FileText className="text-blue-600" size={28} /> Student Transcripts
        </h2>

        {/* Search Bar */}
        {!loading && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Roll No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600">Loading student transcripts...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-2">❌ Error Loading Transcripts</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Student Table */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="p-4 text-left">#</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Roll No</th>
                  <th className="p-4 text-left">GPA</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4">{index + 1}</td>
                      <td className="p-4 font-medium text-gray-800">{student.name}</td>
                      <td className="p-4 text-gray-600">{student.rollNo || "N/A"}</td>
                      <td className="p-4 font-semibold text-blue-600">{student.gpa || 0}</td>
                      <td className="p-4 flex justify-center gap-3">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => generatePDF(student)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition"
                        >
                          <Download size={16} /> Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No students found in your department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Transcript Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 shadow-2xl max-w-2xl w-full relative animate__animated animate__slideInUp">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedStudent(null)}
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-2 text-gray-800">
              {selectedStudent.name}'s Transcript
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Roll No: <span className="font-semibold">{selectedStudent.rollNo || "N/A"}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Department: <span className="font-semibold">{selectedStudent.departmentName || "N/A"}</span>
            </p>

            <div className="bg-gray-900 text-green-100 rounded-lg p-4 mb-6 border border-gray-800 max-h-[70vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm">
{buildTranscriptText(selectedStudent)}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  generatePDF(selectedStudent);
                  setSelectedStudent(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Download size={18} /> Download Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
