import { useState } from "react";
import { FileText, Download, Eye, Search } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function GenerateTranscript() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [students] = useState([
    {
      id: 1,
      name: "Ali Khan",
      rollNo: "BBA-001",
      department: "BBA",
      transcript: [
        { course: "Principles of Management", grade: "A", creditHours: 3 },
        { course: "Marketing Fundamentals", grade: "B+", creditHours: 3 },
        { course: "Business Communication", grade: "A-", creditHours: 3 },
      ],
      gpa: 3.7,
    },
    {
      id: 2,
      name: "Sara Ahmed",
      rollNo: "BBA-002",
      department: "BBA",
      transcript: [
        { course: "Accounting I", grade: "A-", creditHours: 3 },
        { course: "Microeconomics", grade: "B", creditHours: 3 },
        { course: "Statistics", grade: "A", creditHours: 3 },
      ],
      gpa: 3.6,
    },
    {
      id: 3,
      name: "Hamza Tariq",
      rollNo: "BBA-003",
      department: "BBA",
      transcript: [
        { course: "Financial Management", grade: "B+", creditHours: 3 },
        { course: "Organizational Behavior", grade: "A", creditHours: 3 },
        { course: "Business Ethics", grade: "A-", creditHours: 3 },
      ],
      gpa: 3.8,
    },
  ]);

  // Filter students based on search input
  const filteredStudents = students.filter(
    (student) =>
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PDF Generation Function
  const generatePDF = (student) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("University Transcript", 70, 15);
    doc.setFontSize(12);
    doc.text(`Name: ${student.name}`, 20, 30);
    doc.text(`Roll No: ${student.rollNo}`, 20, 38);
    doc.text(`Department: ${student.department}`, 20, 46);

    const tableColumn = ["Course", "Grade", "Credit Hours"];
    const tableRows = student.transcript.map((item) => [
      item.course,
      item.grade,
      item.creditHours,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 55,
    });

    doc.text(`CGPA: ${student.gpa}`, 20, doc.lastAutoTable.finalY + 10);
    doc.save(`${student.rollNo}_Transcript.pdf`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" /> Generate Student Transcripts
        </h2>

        {/* 🔍 Search Bar */}
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
      </div>

      {/* Student Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Roll No</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{student.name}</td>
                  <td className="p-2">{student.rollNo}</td>
                  <td className="p-2 flex justify-center gap-4">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button
                      onClick={() => generatePDF(student)}
                      className="text-green-600 flex items-center gap-1 hover:underline"
                    >
                      <Download size={16} /> Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No student found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transcript Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedStudent(null)}
            >
              ✖
            </button>
            <h3 className="text-xl font-semibold mb-2 text-center">
              {selectedStudent.name}'s Transcript
            </h3>
            <p className="text-sm text-gray-600 mb-2 text-center">
              Roll No: {selectedStudent.rollNo}
            </p>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-1 border">Course</th>
                  <th className="p-1 border">Grade</th>
                  <th className="p-1 border">CH</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent.transcript.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-1 border">{item.course}</td>
                    <td className="p-1 border">{item.grade}</td>
                    <td className="p-1 border text-center">
                      {item.creditHours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 font-semibold text-right">
              GPA: {selectedStudent.gpa}
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => generatePDF(selectedStudent)}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
