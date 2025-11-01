import React, { useState } from "react";

const departments = ["Electrical Engineering", "Software Engineering", "BBA"];

const FacultyManagement = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [activeOption, setActiveOption] = useState("");
  const [facultyList, setFacultyList] = useState([]);
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
  };

  const [formData, setFormData] = useState(initialFormState);

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

  // Add or Update Faculty
  const handleAddOrUpdateFaculty = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const updated = [...facultyList];
      updated[editingIndex] = formData;
      setFacultyList(updated);
      setEditingIndex(null);
    } else {
      setFacultyList([...facultyList, formData]);
    }
    setFormData(initialFormState);
    setActiveOption("");
  };

  // Edit Faculty
  const startEditingFaculty = (index) => {
    setFormData(facultyList[index]);
    setEditingIndex(index);
    setActiveOption("Add Faculty");
  };

  // Delete Faculty
  const deleteFaculty = (index) => {
    const updatedFaculty = facultyList.filter((_, i) => i !== index);
    setFacultyList(updatedFaculty);
  };

  // Search Filter
  const filteredFaculty = facultyList.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.designation.toLowerCase().includes(q)
    );
  });

  // Options
  const options = ["Add Faculty", "Update Faculty", "Search Faculty"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Faculty Management System
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage faculty members across different departments with ease
          </p>
        </div>

        {/* Department Cards */}
        {!selectedDept && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <div
                key={dept}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">
                      {dept.charAt(0)}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {dept}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4">
                    Manage faculty members in {dept}
                  </p>
                  <button
                    onClick={() => setSelectedDept(dept)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg w-full"
                  >
                    View Department
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
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
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
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {facultyList.length} Faculty Members
                </span>
              </div>
            </div>

            {/* Options Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    )}
                    {opt === "Update Faculty" && (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    )}
                    {opt === "Search Faculty" && (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    )}
                    <span>{opt}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Add / Update Faculty Form */}
            {activeOption === "Add Faculty" && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {editingIndex !== null
                    ? "Update Faculty Member"
                    : "Add New Faculty Member"}
                </h3>
                <form onSubmit={handleAddOrUpdateFaculty} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation *
                      </label>
                      <input
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g., Assistant Professor"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualification *
                      </label>
                      <input
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g., PhD in Computer Science"
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
                        placeholder="Area of expertise"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
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
                        Phone Number
                      </label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC
                      </label>
                      <input
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleChange}
                        placeholder="National ID number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Complete residential address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload Faculty Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="w-full"
                      />
                      <p className="text-gray-500 text-sm mt-2">
                        Upload CV, degrees, certificates, etc. (PDF, DOC,
                        Images)
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
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
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {editingIndex !== null ? "Update Faculty" : "Add Faculty"}
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
                    <svg
                      className="w-6 h-6 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Manage Faculty Members
                  </h3>
                </div>
                {facultyList.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      No faculty members added yet.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Use the "Add Faculty" option to add new faculty members.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {facultyList.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {f.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">
                                {f.name}
                              </h4>
                              <p className="text-gray-600">{f.designation}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  {f.qualification}
                                </span>
                                {f.specialization && (
                                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                    {f.specialization}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-2">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                {f.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-4 md:mt-0">
                            <button
                              onClick={() => startEditingFaculty(idx)}
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => deleteFaculty(idx)}
                              className="flex items-center text-red-600 hover:text-red-800 transition-colors font-medium"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
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

            {/* Search Faculty */}
            {activeOption === "Search Faculty" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search Faculty Members
                </h3>
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search by name, email, or designation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {filteredFaculty.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      {searchQuery
                        ? "No faculty members found matching your search."
                        : "No faculty members available."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFaculty.map((f, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                            {f.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg mb-1">
                              {f.name}
                            </h4>
                            <p className="text-blue-600 font-medium mb-2">
                              {f.designation}
                            </p>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                {f.email}
                              </div>
                              {f.phone && (
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  {f.phone}
                                </div>
                              )}
                              {f.qualification && (
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 14l9-5-9-5-9 5 9 5z"
                                    />
                                  </svg>
                                  {f.qualification}
                                </div>
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
