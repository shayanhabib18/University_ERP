import React, { useState } from 'react';

export default function Transcript() {
  const [showTranscript, setShowTranscript] = useState(false);

  const current = {
    session: "Sp-2025",
    studentName: "Shayan Habib",
    registrationNo: "2022-BSSE-120",
    degree: "BS Software Engineering",
    department: "Department of Computing",
    gpa: "3.48",
    cgpa: "3.52",
    standing: "Good",
    courses: [
      { id: "MS 3801", name: "Entrepreneurship & Technology", credit: 3, grade: "A" },
      { id: "CS 2406", name: "Information Security", credit: 3, grade: "A-" },
      { id: "MS 4103", name: "Leadership & Team Management", credit: 2, grade: "B+" },
      { id: "HU 1101", name: "Islamic Studies", credit: 1, grade: "A+" },
    ]
  };

  const handleGenerateTranscript = () => {
    setShowTranscript(true); // Just show transcript, no alert
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">🎓 Transcript</h2>

      {!showTranscript && (
        <div className="text-center">
          <button
            onClick={handleGenerateTranscript}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded text-sm"
          >
            Generate Transcript
          </button>
        </div>
      )}

      {showTranscript && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <p><strong>Name:</strong> {current.studentName}</p>
            <p><strong>Reg No:</strong> {current.registrationNo}</p>
            <p><strong>Session:</strong> {current.session}</p>
            <p><strong>Degree:</strong> {current.degree}</p>
            <p><strong>Department:</strong> {current.department}</p>
            <p><strong>GPA:</strong> {current.gpa}</p>
            <p><strong>CGPA:</strong> {current.cgpa}</p>
            <p><strong>Standing:</strong> {current.standing}</p>
          </div>

          <table className="w-full border mt-6 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2">Course Code</th>
                <th className="px-3 py-2">Course Title</th>
                <th className="px-3 py-2">Credit</th>
                <th className="px-3 py-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {current.courses.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-1">{c.id}</td>
                  <td className="px-3 py-1">{c.name}</td>
                  <td className="px-3 py-1">{c.credit}</td>
                  <td className="px-3 py-1 font-semibold">{c.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
