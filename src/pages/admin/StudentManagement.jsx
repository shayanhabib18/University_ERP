import React, { useState } from "react";

const departments = ["Electrical Engineering", "Software Engineering", "BBA"];

const StudentManagement = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [activeOption, setActiveOption] = useState("");
  const [students, setStudents] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const initialFormState = {
    fullName: "",
    fatherName: "",
    dob: "",
    gender: "",
    rollNo: "",
    cnic: "",
    permanentAddress: "",
    currentAddress: "",
    universityEmail: "",
    personalEmail: "",
    studentPhone: "",
    parentPhone: "",
    academicDocs: [],
    attendance: "90%", // example static value
    grades: "A",       // example static value
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      academicDocs: [...e.target.files],
    }));
  };

  const handleAddOrUpdateStudent = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const updatedStudents = [...students];
      updatedStudents[editingIndex] = formData;
      setStudents(updatedStudents);
      setEditingIndex(null);
    } else {
      setStudents([...students, formData]);
    }
    setFormData(initialFormState);
    setActiveOption("");
  };

  const startEditingStudent = (index) => {
    setFormData(students[index]);
    setEditingIndex(index);
    setActiveOption("Add Student");
  };

  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase();
    return (
      student.rollNo.toLowerCase().includes(q) ||
      student.universityEmail.toLowerCase().includes(q) ||
      student.fullName.toLowerCase().includes(q)
    );
  });

  const options = [
    "Add Student",
    "Update Student",
    "Search Student",
    "Generate Transcript",
    "Generate Roll No Slips",
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-800 text-center">Student Management</h1>

      {!selectedDept && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept}
              className="border p-6 rounded-lg shadow-md bg-white flex flex-col justify-between items-center"
            >
              <h2 className="text-xl font-semibold mb-4 text-center">{dept}</h2>
              <button
                onClick={() => setSelectedDept(dept)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedDept && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-blue-800">Department: {selectedDept}</h2>
            <button
              onClick={() => {
                setSelectedDept(null);
                setActiveOption("");
              }}
              className="text-red-600 font-medium hover:underline"
            >
              ← Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveOption(opt)}
                className="bg-gray-100 hover:bg-gray-200 border p-4 rounded-md shadow text-center font-medium"
              >
                {opt}
              </button>
            ))}
          </div>

          {/* --- Add / Update Form --- */}
          {activeOption === "Add Student" && (
            <form onSubmit={handleAddOrUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="p-3 border rounded-md" required />
                <input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father's Name" className="p-3 border rounded-md" required />
                <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="p-3 border rounded-md" required />
                <select name="gender" value={formData.gender} onChange={handleChange} className="p-3 border rounded-md" required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input name="rollNo" value={formData.rollNo} onChange={handleChange} placeholder="Roll No" className="p-3 border rounded-md" required />
                <input name="cnic" value={formData.cnic} onChange={handleChange} placeholder="CNIC" className="p-3 border rounded-md" required />
                <input name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} placeholder="Permanent Address" className="p-3 border rounded-md" />
                <input name="currentAddress" value={formData.currentAddress} onChange={handleChange} placeholder="Current Address" className="p-3 border rounded-md" />
                <input name="universityEmail" value={formData.universityEmail} onChange={handleChange} placeholder="University Email" className="p-3 border rounded-md" required />
                <input name="personalEmail" value={formData.personalEmail} onChange={handleChange} placeholder="Personal Email" className="p-3 border rounded-md" />
                <input name="studentPhone" value={formData.studentPhone} onChange={handleChange} placeholder="Student Phone" className="p-3 border rounded-md" />
                <input name="parentPhone" value={formData.parentPhone} onChange={handleChange} placeholder="Parent Phone" className="p-3 border rounded-md" />
              </div>

              <div>
                <label className="font-medium block mb-1">Academic Documents</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full border rounded-md p-2" />
              </div>

              <button type="submit" className="mt-4 bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700">
                {editingIndex !== null ? "Update Student" : "Add Student"}
              </button>
            </form>
          )}

          {/* --- Update List --- */}
          {activeOption === "Update Student" && (
            <div>
              {students.length === 0 ? (
                <p>No students available.</p>
              ) : (
                <ul className="space-y-3">
                  {students.map((student, idx) => (
                    <li key={idx} className="border p-4 rounded flex justify-between">
                      <span>{student.fullName} - {student.rollNo}</span>
                      <button className="text-blue-600 hover:underline" onClick={() => startEditingStudent(idx)}>Edit</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* --- Search Student --- */}
          {activeOption === "Search Student" && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search by Roll No, Email, or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-2/3 p-3 border rounded-md mb-4"
              />

              {filteredStudents.length === 0 ? (
                <p className="text-gray-500">No student found.</p>
              ) : (
                <ul className="space-y-2">
                  {filteredStudents.map((student, idx) => (
                    <li key={idx} className="border p-3 rounded-md">
                      <strong>{student.fullName}</strong> ({student.rollNo})<br />
                      {student.universityEmail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* --- Generate Transcript --- */}
          {activeOption === "Generate Transcript" && (
            <div className="mt-6">
              {students.length === 0 ? (
                <p>No student data to show transcripts.</p>
              ) : (
                <div className="space-y-4">
                  {students.map((s, i) => (
                    <div key={i} className="border p-4 rounded bg-white shadow-sm">
                      <h3 className="font-bold text-lg text-blue-700">{s.fullName}</h3>
                      <p><strong>Roll No:</strong> {s.rollNo}</p>
                      <p><strong>Attendance:</strong> {s.attendance}</p>
                      <p><strong>Grades:</strong> {s.grades}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
