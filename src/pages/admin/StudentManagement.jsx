import React, { useState } from "react";

const departments = ["Electrical Engineering", "Software Engineering", "BBA"];

const StudentManagement = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [activeOption, setActiveOption] = useState("");
  const [students, setStudents] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAcademicRecordsModal, setShowAcademicRecordsModal] = useState(false);
  const [selectedStudentForRecords, setSelectedStudentForRecords] = useState(null);

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
    joiningSession: "",
    joiningDate: "",
    academicDocs: [],
    attendance: "",
    grades: "",
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

  const deleteStudent = (index) => {
    const updatedStudents = students.filter((_, i) => i !== index);
    setStudents(updatedStudents);
  };

  const viewAcademicRecords = (student) => {
    setSelectedStudentForRecords(student);
    setShowAcademicRecordsModal(true);
  };

  const generateTranscript = (student) => {
    // Generate transcript content
    const transcriptContent = `
═══════════════════════════════════════════════════════════════
                    OFFICIAL ACADEMIC TRANSCRIPT
═══════════════════════════════════════════════════════════════

Student Name: ${student.fullName}
Father's Name: ${student.fatherName}
Roll Number: ${student.rollNo}
CNIC: ${student.cnic}
Department: ${selectedDept}
Date of Birth: ${student.dob}

───────────────────────────────────────────────────────────────
                      ACADEMIC PERFORMANCE
───────────────────────────────────────────────────────────────

Overall Grade: ${student.grades}
Attendance: ${student.attendance}

───────────────────────────────────────────────────────────────
                      CONTACT INFORMATION
───────────────────────────────────────────────────────────────

University Email: ${student.universityEmail}
Personal Email: ${student.personalEmail || 'N/A'}
Student Phone: ${student.studentPhone || 'N/A'}
Parent/Guardian Phone: ${student.parentPhone || 'N/A'}

Permanent Address: ${student.permanentAddress || 'N/A'}
Current Address: ${student.currentAddress || 'N/A'}

───────────────────────────────────────────────────────────────
Generated on: ${new Date().toLocaleDateString()}
This is an official document from the University ERP System
═══════════════════════════════════════════════════════════════
    `;

    // Create and download the transcript
    const blob = new Blob([transcriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Transcript_${student.rollNo}_${student.fullName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase();
    return (
      student.rollNo.toLowerCase().includes(q) ||
      student.universityEmail.toLowerCase().includes(q) ||
      student.fullName.toLowerCase().includes(q)
    );
  });

  const options = ["Add Student", "Update Student", "Search Student", "Delete Student", "Show Prev Academic History"];

  // Function to generate avatar background color based on name
  const getAvatarColor = (name) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Student Management System
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage student records, academic information, and departmental data efficiently
          </p>
        </div>

        {/* Department Selection */}
        {!selectedDept && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <div
                key={dept}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${getAvatarColor(dept)} rounded-2xl flex items-center justify-center mb-4`}>
                    <span className="text-white font-bold text-2xl">
                      {dept.split(' ').map(word => word[0]).join('')}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {dept}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4">
                    Manage student records in {dept}
                  </p>
                  <button
                    onClick={() => setSelectedDept(dept)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg w-full"
                  >
                    Access Department
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Department Details */}
        {selectedDept && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Header with Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <button
                    onClick={() => {
                      setSelectedDept(null);
                      setActiveOption("");
                    }}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    All Departments
                  </button>
                  <span className="mx-2">/</span>
                  <span>{selectedDept}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {selectedDept}
                </h2>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {students.length} Students
                </span>
              </div>
            </div>

            {/* Options Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveOption(opt)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 font-medium text-center ${
                    activeOption === opt
                      ? "border-green-500 bg-green-50 text-green-700 shadow-md"
                      : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {opt === "Add Student" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                    {opt === "Update Student" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                    {opt === "Search Student" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    {opt === "Delete Student" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    {opt === "Show Prev Academic History" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    <span>{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Add / Update Student Form */}
            {activeOption === "Add Student" && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {editingIndex !== null ? "Update Student Record" : "Register New Student"}
                </h3>
                <form onSubmit={handleAddOrUpdateStudent} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="md:col-span-2">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Personal Information</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter student's full name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Name *
                      </label>
                      <input
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="Enter father's name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Academic Information */}
                    <div className="md:col-span-2 mt-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Academic Information</h4>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC/B-Form *
                      </label>
                      <input
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleChange}
                        placeholder="Enter CNIC or B-Form number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Joining Session *
                      </label>
                      <select
                        name="joiningSession"
                        value={formData.joiningSession}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        required
                      >
                        <option value="">Select Joining Session</option>
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Joining Date *
                      </label>
                      <input
                        name="joiningDate"
                        type="date"
                        value={formData.joiningDate}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        required
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="md:col-span-2 mt-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Contact Information</h4>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        University Email *
                      </label>
                      <input
                        name="universityEmail"
                        type="email"
                        value={formData.universityEmail}
                        onChange={handleChange}
                        placeholder="student@university.edu"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personal Email
                      </label>
                      <input
                        name="personalEmail"
                        type="email"
                        value={formData.personalEmail}
                        onChange={handleChange}
                        placeholder="personal@email.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Phone
                      </label>
                      <input
                        name="studentPhone"
                        value={formData.studentPhone}
                        onChange={handleChange}
                        placeholder="+92 300 1234567"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent/Guardian Phone
                      </label>
                      <input
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleChange}
                        placeholder="+92 300 1234567"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    {/* Address Information */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permanent Address
                      </label>
                      <input
                        name="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={handleChange}
                        placeholder="Enter permanent address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Address
                      </label>
                      <input
                        name="currentAddress"
                        value={formData.currentAddress}
                        onChange={handleChange}
                        placeholder="Enter current address (if different)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Documents Upload */}
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Academic Documents
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="w-full h-full opacity-0 absolute top-0 left-0 cursor-pointer" style={{ zIndex: 2 }}
                      />
                      <p className="text-gray-600 font-medium">Upload Academic Documents</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Transcripts, Certificates, CNIC, Photos (PDF, DOC, Images)
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(initialFormState);
                        setEditingIndex(null);
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingIndex !== null ? "Update Student" : "Register Student"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Update Student List */}
            {activeOption === "Update Student" && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Manage Student Records
                  </h3>
                </div>
                {students.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No student records found.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Use the "Add Student" option to register new students.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {students.map((student, idx) => (
                      <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(student.fullName)} rounded-xl flex items-center justify-center text-white font-semibold text-lg`}>
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">{student.fullName}</h4>
                              <p className="text-gray-600">{student.rollNo}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  {student.gender}
                                </span>
                                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  Attendance: {student.attendance}
                                </span>
                                <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                  Grade: {student.grades}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-2">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {student.universityEmail}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                            <button
                              onClick={() => startEditingStudent(idx)}
                              className="flex items-center text-green-600 hover:text-green-800 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-green-50"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => viewAcademicRecords(student)}
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-blue-50"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Records
                            </button>
                            <button
                              onClick={() => generateTranscript(student)}
                              className="flex items-center text-purple-600 hover:text-purple-800 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-purple-50"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              Transcript
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) {
                                  deleteStudent(idx);
                                }
                              }}
                              className="flex items-center text-red-600 hover:text-red-800 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-red-50"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Delete Student */}
            {activeOption === "Delete Student" && (
              <div className="bg-white rounded-xl border border-red-200">
                <div className="p-6 border-b border-red-200 bg-red-50">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Student Records
                  </h3>
                  <p className="text-sm text-red-600 mt-2">Warning: This action is permanent and cannot be undone.</p>
                </div>
                {students.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No student records found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {students.map((student, idx) => (
                      <div key={idx} className="p-6 hover:bg-red-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(student.fullName)} rounded-xl flex items-center justify-center text-white font-semibold text-lg`}>
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">{student.fullName}</h4>
                              <p className="text-gray-600">{student.rollNo}</p>
                              <div className="flex items-center text-sm text-gray-500 mt-2">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {student.universityEmail}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete ${student.fullName} (${student.rollNo})? This action cannot be undone.`)) {
                                deleteStudent(idx);
                              }
                            }}
                            className="mt-4 md:mt-0 flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md hover:shadow-lg"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Student
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Student */}
            {activeOption === "Search Student" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Student Records
                </h3>
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search by roll number, email, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      {searchQuery ? "No students found matching your search." : "No student records available."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredStudents.map((student, idx) => {
                      const actualStudentIndex = students.findIndex(s => s.rollNo === student.rollNo);
                      return (
                      <div key={idx} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-r ${getAvatarColor(student.fullName)} rounded-xl flex items-center justify-center text-white font-semibold text-xl`}>
                            {student.fullName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg mb-1">{student.fullName}</h4>
                            <p className="text-green-600 font-medium mb-2">{student.rollNo}</p>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {student.universityEmail}
                              </div>
                              {student.studentPhone && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {student.studentPhone}
                                </div>
                              )}
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {student.gender} • {student.dob}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              {student.attendance && (
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  {student.attendance} Attendance
                                </span>
                              )}
                              {student.grades && (
                                <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                  Grade: {student.grades}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                              <button
                                onClick={() => startEditingStudent(actualStudentIndex)}
                                className="flex items-center text-green-600 hover:text-green-800 transition-colors font-medium text-sm px-3 py-2 rounded-lg hover:bg-green-50 border border-green-200"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Details
                              </button>
                              <button
                                onClick={() => viewAcademicRecords(student)}
                                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-200"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Academic History
                              </button>
                              <button
                                onClick={() => generateTranscript(student)}
                                className="flex items-center text-purple-600 hover:text-purple-800 transition-colors font-medium text-sm px-3 py-2 rounded-lg hover:bg-purple-50 border border-purple-200"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                Transcript
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) {
                                    deleteStudent(actualStudentIndex);
                                  }
                                }}
                                className="flex items-center text-red-600 hover:text-red-800 transition-colors font-medium text-sm px-3 py-2 rounded-lg hover:bg-red-50 border border-red-200"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Show Previous Academic History */}
            {activeOption === "Show Prev Academic History" && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Student Academic History
                  </h3>
                </div>
                {students.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No student records found.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Use the "Add Student" option to register new students.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {students.map((student, idx) => (
                      <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(student.fullName)} rounded-xl flex items-center justify-center text-white font-semibold text-lg`}>
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">{student.fullName}</h4>
                              <p className="text-gray-600">{student.rollNo}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  {student.gender}
                                </span>
                                {student.attendance && (
                                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                    Attendance: {student.attendance}
                                  </span>
                                )}
                                {student.grades && (
                                  <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                    Grade: {student.grades}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-2">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {student.universityEmail}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                            <button
                              onClick={() => viewAcademicRecords(student)}
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-blue-50"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Records
                            </button>
                            <button
                              onClick={() => generateTranscript(student)}
                              className="flex items-center text-purple-600 hover:text-purple-800 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-purple-50"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              Transcript
                            </button>
                            <button
                              onClick={() => startEditingStudent(idx)}
                              className="flex items-center text-green-600 hover:text-green-800 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-green-50"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Academic Records Modal */}
        {showAcademicRecordsModal && selectedStudentForRecords && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Academic Records</h3>
                    <p className="text-blue-100">{selectedStudentForRecords.fullName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAcademicRecordsModal(false);
                      setSelectedStudentForRecords(null);
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Personal Information */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.fullName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Father's Name</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.fatherName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.dob}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Gender</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.gender}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">CNIC/B-Form</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.cnic}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Department</p>
                      <p className="font-semibold text-gray-800">{selectedDept}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Performance */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Academic Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-2">Roll Number</p>
                      <p className="text-2xl font-bold text-green-700">{selectedStudentForRecords.rollNo}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">Overall Grade</p>
                      <p className="text-2xl font-bold text-blue-700">{selectedStudentForRecords.grades}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-600 mb-2">Attendance</p>
                      <p className="text-2xl font-bold text-purple-700">{selectedStudentForRecords.attendance}</p>
                    </div>
                  </div>
                </div>

                {/* Enrollment Information */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Enrollment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Joining Session</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.joiningSession || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Joining Date</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.joiningDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">University Email</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.universityEmail}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Personal Email</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.personalEmail || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Student Phone</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.studentPhone || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Parent/Guardian Phone</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.parentPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Address Information
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Permanent Address</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.permanentAddress || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Current Address</p>
                      <p className="font-semibold text-gray-800">{selectedStudentForRecords.currentAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => generateTranscript(selectedStudentForRecords)}
                    className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Generate Transcript
                  </button>
                  <button
                    onClick={() => {
                      setShowAcademicRecordsModal(false);
                      setSelectedStudentForRecords(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;