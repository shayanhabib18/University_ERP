import React, { useEffect, useState } from "react";
import { departmentAPI, facultyAPI } from "../../services/api";

const FacultyManagement = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState("");
  const [activeOption, setActiveOption] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyError, setFacultyError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const initialFormState = {
    name: "",
    designation: "",
    qualification: "",
    specialization: "",
    email: "",
    phone: "",
    joiningDate: "",
    cnic: "",
    address: "",
    documents: [],

    // Additional fields for consistency
    status: "ACTIVE",
    department: "",
    experience: "",
    // 🔐 AUTH FIELDS (frontend invisible)
    role: "FACULTY",
    mustChangePassword: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const getDeptName = (dept) =>
    (dept && (dept.name || dept.department_name || dept.title || dept.code)) || "";

  const selectedDeptName = getDeptName(selectedDept);

  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      setDepartmentsError("");
      const data = await departmentAPI.getAll();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      setDepartmentsError(err?.message || "Failed to load departments");
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept?.id) {
      loadFaculty(selectedDept.id);
    } else {
      setFacultyList([]);
    }
  }, [selectedDept]);

  const loadFaculty = async (departmentId) => {
    try {
      setFacultyLoading(true);
      setFacultyError("");
      const data = await facultyAPI.getByDepartment(departmentId);
      setFacultyList(Array.isArray(data) ? data : []);
    } catch (err) {
      setFacultyError(err?.message || "Failed to load faculty");
      setFacultyList([]);
    } finally {
      setFacultyLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      documents: [...e.target.files],
    }));
  };

  const toPayload = (data) => ({
    name: data.name?.trim(),
    designation: data.designation?.trim(),
    qualification: data.qualification?.trim(),
    specialization: data.specialization || null,
    email: data.email?.trim(),
    phone: data.phone?.trim(),
    cnic: data.cnic?.trim(),
    address: data.address || null,
    experience:
      data.experience === "" || data.experience === null || data.experience === undefined
        ? null
        : Number(data.experience),
    joining_date: data.joiningDate || null,
    department_id: selectedDept?.id,
    status: data.status || "ACTIVE",
    role: data.role || "FACULTY",
    must_change_password: data.mustChangePassword ?? true,
  });

  const handleAddOrUpdateFaculty = async (e) => {
    e.preventDefault();
    if (!selectedDept?.id) {
      alert("Please select a department first.");
      return;
    }

    try {
      const payload = toPayload(formData);
      if (editingIndex !== null) {
        const target = facultyList[editingIndex];
        await facultyAPI.update(target.id, payload);
      } else {
        await facultyAPI.create(payload);
      }
      await loadFaculty(selectedDept.id);
      setEditingIndex(null);
      setFormData(initialFormState);
      setActiveOption("");
    } catch (err) {
      alert(err?.message || "Failed to save faculty");
    }
  };

  // Edit Faculty
  const startEditingFaculty = (index) => {
    const f = facultyList[index];
    setFormData({
      name: f.name || "",
      designation: f.designation || "",
      qualification: f.qualification || "",
      specialization: f.specialization || "",
      email: f.email || "",
      phone: f.phone || "",
      joiningDate: f.joining_date || "",
      cnic: f.cnic || "",
      address: f.address || "",
      documents: [],
      status: f.status || "ACTIVE",
      department: selectedDeptName,
      experience: f.experience ?? "",
      role: f.role || "FACULTY",
      mustChangePassword: f.must_change_password ?? true,
    });
    setEditingIndex(index);
    setActiveOption("Add Faculty");
  };

  // Delete Faculty
  const deleteFaculty = async (index) => {
    const target = facultyList[index];
    if (!target?.id) return;
    if (!window.confirm("Are you sure you want to delete this faculty member?")) return;
    try {
      await facultyAPI.delete(target.id);
      await loadFaculty(selectedDept.id);
    } catch (err) {
      alert(err?.message || "Failed to delete faculty");
    }
  };

  // Search Filter
  const filteredFaculty = facultyList.filter((f) => {
    const q = searchQuery.toLowerCase();
    const name = (f.name || "").toLowerCase();
    const email = (f.email || "").toLowerCase();
    const designation = (f.designation || "").toLowerCase();
    const qualification = (f.qualification || "").toLowerCase();
    return (
      name.includes(q) ||
      email.includes(q) ||
      designation.includes(q) ||
      qualification.includes(q)
    );
  });

  const options = ["Add Faculty", "Update Faculty", "Search Faculty", "Delete Faculty"];

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

  // Function to get department color
  const getDepartmentColor = (dept) => {
    const colors = {
      "Electrical Engineering": "from-orange-500 to-amber-500",
      "Software Engineering": "from-blue-500 to-indigo-500",
      "BBA": "from-emerald-500 to-green-500",
    };
    return colors[dept] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Faculty Management System
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage faculty members, academic information, and departmental assignments efficiently
          </p>
        </div>

        {/* Department Selection */}
        {!selectedDept && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {departmentsLoading && (
              <div className="md:col-span-3 text-center text-gray-600">Loading departments...</div>
            )}
            {!departmentsLoading && departmentsError && (
              <div className="md:col-span-3 text-center">
                <p className="text-red-600 font-medium mb-2">{departmentsError}</p>
                <button
                  onClick={loadDepartments}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {!departmentsLoading && !departmentsError && departments.map((dept) => {
              const deptName = getDeptName(dept);
              if (!deptName) return null;
              return (
              <div
                key={dept.id || dept.code || deptName}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${getDepartmentColor(deptName)} rounded-2xl flex items-center justify-center mb-4`}>
                    <span className="text-white font-bold text-2xl">
                      {deptName.split(" ").map((word) => word[0]).join("")}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {deptName}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4">
                    Manage faculty members in {deptName}
                  </p>
                  <button
                    onClick={() => setSelectedDept(dept)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg w-full"
                  >
                    Access Department
                  </button>
                </div>
              </div>
              );
            })}
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
                  <span>{selectedDeptName}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {selectedDeptName}
                </h2>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {facultyList.length} Faculty Members
                </span>
              </div>
            </div>

            {facultyError && (
              <div className="mb-4 text-red-600">{facultyError}</div>
            )}
            {facultyLoading && !facultyError && (
              <div className="mb-4 text-gray-600">Loading faculty...</div>
            )}

            {/* Options Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveOption(opt)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 font-medium text-center ${
                    activeOption === opt
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {opt === "Add Faculty" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                    {opt === "Update Faculty" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                    {opt === "Search Faculty" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    {opt === "Delete Faculty" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <span>{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Add / Update Faculty Form */}
            {activeOption === "Add Faculty" && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {editingIndex !== null ? "Update Faculty Member" : "Register New Faculty Member"}
                </h3>
                
                {/* Auth Info Banner */}
                <div className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-xl">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold">Login credentials will be automatically generated</p>
                      <p className="text-blue-100 text-sm mt-1">
                        Faculty will receive email credentials and be required to change password on first login
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAddOrUpdateFaculty} className="space-y-6">
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
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter faculty member's full name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation *
                      </label>
                      <select
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">Select Designation</option>
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Senior Lecturer">Senior Lecturer</option>
                        <option value="Visiting Faculty">Visiting Faculty</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualification *
                      </label>
                      <input
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="PhD, MS, BS, etc."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <input
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="Research areas, subjects"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="md:col-span-2 mt-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Contact Information</h4>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (Username) *
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="faculty@university.edu"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+92 300 1234567"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC *
                      </label>
                      <input
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleChange}
                        placeholder="XXXXX-XXXXXXX-X"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Joining Date
                      </label>
                      <input
                        name="joiningDate"
                        type="date"
                        value={formData.joiningDate}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Professional Information */}
                    <div className="md:col-span-2 mt-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Professional Information</h4>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (Years)
                      </label>
                      <input
                        name="experience"
                        type="number"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Years of experience"
                        min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Address Information */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter complete address"
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Documents Upload */}
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Supporting Documents
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
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
                      <p className="text-gray-600 font-medium">Upload Supporting Documents</p>
                      <p className="text-gray-500 text-sm mt-1">
                        CV, Certificates, Degrees, CNIC, Photos (PDF, DOC, Images)
                      </p>
                    </div>
                    {formData.documents.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          {formData.documents.length} file(s) selected
                        </p>
                      </div>
                    )}
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
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingIndex !== null ? "Update Faculty" : "Register Faculty"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Update Faculty List */}
            {activeOption === "Update Faculty" && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Manage Faculty Members
                  </h3>
                </div>
                {facultyList.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No faculty members found.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Use the "Add Faculty" option to register new faculty members.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {facultyList.map((faculty, idx) => (
                      <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(faculty.name)} rounded-xl flex items-center justify-center text-white font-semibold text-lg`}>
                              {faculty.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">{faculty.name}</h4>
                              <p className="text-gray-600">{faculty.designation}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  {faculty.qualification}
                                </span>
                                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  {faculty.status || "ACTIVE"}
                                </span>
                                {faculty.experience && (
                                  <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                                    {faculty.experience} years
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-2">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {faculty.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-4 md:mt-0">
                            <button
                              onClick={() => startEditingFaculty(idx)}
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => deleteFaculty(idx)}
                              className="flex items-center text-red-600 hover:text-red-800 transition-colors font-medium"
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

            {/* Delete Faculty */}
            {activeOption === "Delete Faculty" && (
              <div className="bg-white rounded-xl border border-red-200">
                <div className="p-6 border-b border-red-200 bg-red-50">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Faculty Members
                  </h3>
                  <p className="text-sm text-red-600 mt-2">Warning: This action is permanent and cannot be undone.</p>
                </div>
                {facultyList.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No faculty members found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {facultyList.map((faculty, idx) => (
                      <div key={idx} className="p-6 hover:bg-red-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(faculty.name)} rounded-xl flex items-center justify-center text-white font-semibold text-lg`}>
                              {faculty.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">{faculty.name}</h4>
                              <p className="text-gray-600">{faculty.designation}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  {faculty.qualification}
                                </span>
                                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  {selectedDeptName || "Department"}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-2">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {faculty.email}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteFaculty(idx)}
                            className="mt-4 md:mt-0 flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md hover:shadow-lg"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Faculty
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Faculty */}
            {activeOption === "Search Faculty" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Faculty Members
                </h3>
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search by name, email, designation, or qualification..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {filteredFaculty.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      {searchQuery ? "No faculty found matching your search." : "No faculty records available."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFaculty.map((faculty, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-r ${getAvatarColor(faculty.name)} rounded-xl flex items-center justify-center text-white font-semibold text-xl`}>
                            {faculty.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg mb-1">{faculty.name}</h4>
                            <p className="text-blue-600 font-medium mb-2">{faculty.designation}</p>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {faculty.email}
                              </div>
                              {faculty.phone && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {faculty.phone}
                                </div>
                              )}
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                                {faculty.qualification} • {faculty.specialization || "General"}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                {faculty.joiningDate || "Not specified"}
                              </span>
                              {faculty.experience && (
                                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  {faculty.experience} years exp
                                </span>
                              )}
                            </div>
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
      </div>
    </div>
  );
};

export default FacultyManagement;
