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
                
                // Calculate GPA if grades are available
                if (courseData.length > 0) {
                  const validGrades = courseData.filter(c => c.grade && c.grade !== 'N/A');
                  if (validGrades.length > 0) {
                    const gradePoints = {
                      'A': 4.0, 'A-': 3.7,
                      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                      'D': 1.0, 'F': 0.0
                    };
                    const totalPoints = validGrades.reduce((sum, c) => {
                      const points = gradePoints[c.grade] || 0;
                      const credits = c.credit_hours || 3;
                      return sum + (points * credits);
                    }, 0);
                    const totalCredits = validGrades.reduce((sum, c) => sum + (c.credit_hours || 3), 0);
                    gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
                  }
                }
              }

              return {
                ...student,
                name: student.full_name || student.name || "Unknown",
                rollNo: student.roll_number || "N/A",
                transcript: courseData.map(c => ({
                  course: c.course_name || c.course_code || 'Unknown Course',
                  grade: c.grade || 'N/A',
                  creditHours: c.credit_hours || 3,
                })),
                gpa: gpa || 0,
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
      let yPosition = 15;
      
      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text("Academic Transcript", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;
      
      // Student Info
      doc.setFontSize(11);
      doc.setFont(undefined, "normal");
      doc.text(`Student Name: ${student.name || "N/A"}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Roll Number: ${student.rollNo || "N/A"}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Department: ${student.department_id || "N/A"}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 12;

      // Courses Section
      if (student.transcript && Array.isArray(student.transcript) && student.transcript.length > 0) {
        doc.setFont(undefined, "bold");
        doc.setFontSize(12);
        doc.text("Course Details:", 20, yPosition);
        yPosition += 8;

        // Manual table header
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.setFillColor(41, 128, 185);
        doc.setTextColor(255, 255, 255);
        
        const colWidths = [80, 30, 40];
        const cols = ["Course", "Grade", "Credit Hours"];
        let xPos = 20;
        
        cols.forEach((col, idx) => {
          doc.rect(xPos, yPosition - 6, colWidths[idx], 7, "F");
          doc.text(col, xPos + 2, yPosition, { maxWidth: colWidths[idx] - 4 });
          xPos += colWidths[idx];
        });
        
        yPosition += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");

        // Table rows
        student.transcript.forEach((item, idx) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          const bgColor = idx % 2 === 0 ? [240, 240, 240] : [255, 255, 255];
          xPos = 20;
          doc.setFillColor(...bgColor);
          
          const rowData = [
            item.course || "Unknown",
            item.grade || "N/A",
            item.creditHours?.toString() || "3",
          ];
          
          rowData.forEach((data, colIdx) => {
            doc.rect(xPos, yPosition - 6, colWidths[colIdx], 7, "F");
            doc.text(data, xPos + 2, yPosition, { maxWidth: colWidths[colIdx] - 4 });
            xPos += colWidths[colIdx];
          });
          
          yPosition += 7;
        });

        yPosition += 5;
      } else {
        doc.setFont(undefined, "normal");
        doc.setFontSize(10);
        doc.text("No courses enrolled yet.", 20, yPosition);
        yPosition += 10;
      }

      // GPA Section
      doc.setFillColor(220, 240, 255);
      doc.rect(20, yPosition, 170, 12, "F");
      doc.setFont(undefined, "bold");
      doc.setFontSize(12);
      doc.text(`CGPA: ${student.gpa || "0.00"}`, 25, yPosition + 8);
      yPosition += 20;

      // Footer
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("This is an official transcript issued by the Department", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

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
              Department: <span className="font-semibold">{selectedStudent.department_id || "N/A"}</span>
            </p>

            {/* Courses Table */}
            {selectedStudent.transcript && selectedStudent.transcript.length > 0 ? (
              <div className="mb-4 border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-3 text-left font-semibold">Course</th>
                      <th className="p-3 text-center font-semibold">Grade</th>
                      <th className="p-3 text-center font-semibold">Credit Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.transcript.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-3 border-t">{item.course}</td>
                        <td className="p-3 border-t text-center font-semibold">{item.grade}</td>
                        <td className="p-3 border-t text-center">{item.creditHours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800">No courses enrolled yet.</p>
              </div>
            )}

            {/* GPA */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-lg font-bold text-blue-900">
                CGPA: <span className="text-2xl text-blue-600">{selectedStudent.gpa || 0}</span>
              </p>
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
