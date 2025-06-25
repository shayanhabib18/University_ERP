import React, { useState } from 'react';

const allCourses = {
  'Semester 1': ['OOP', 'DSA'],
  'Semester 2': ['DBMS', 'OS'],
  'Semester 3': ['AI', 'ML'],
};

const FacultyManagement = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    department: '', 
    designation: '' 
  });
  const [editId, setEditId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState({});
  const [exactSearchName, setExactSearchName] = useState('');
  const [exactMatch, setExactMatch] = useState(null);
  const [viewingDocumentsFor, setViewingDocumentsFor] = useState(null);
  const [tempDocuments, setTempDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: '',
    file: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDocumentChange = (e) => {
    if (e.target.name === 'file') {
      setNewDocument({ ...newDocument, file: e.target.files[0] });
    } else {
      setNewDocument({ ...newDocument, [e.target.name]: e.target.value });
    }
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editId) {
      setFacultyList((prev) =>
        prev.map((f) => (f.id === editId ? { ...f, ...formData } : f))
      );
      setEditId(null);
    } else {
      setFacultyList((prev) => [
        ...prev,
        { 
          ...formData, 
          id: crypto.randomUUID(), 
          status: 'Active', 
          courses: {},
          documents: tempDocuments 
        },
      ]);
    }

    setFormData({ name: '', email: '', department: '', designation: '' });
    setTempDocuments([]);
  };

  const handleDelete = (id) => {
    setFacultyList((prev) => prev.filter((f) => f.id !== id));
  };

  const handleEdit = (faculty) => {
    setFormData(faculty);
    setEditId(faculty.id);
    setTempDocuments(faculty.documents || []);
  };

  const handleToggleStatus = (id) => {
    setFacultyList((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' } : f
      )
    );
  };

  const handleAssignCourses = () => {
    setFacultyList((prev) =>
      prev.map((f) =>
        f.id === assigningId ? { ...f, courses: assignedCourses } : f
      )
    );
    setAssigningId(null);
    setAssignedCourses({});
  };

  const handleExactSearch = () => {
    const match = facultyList.find(
      (f) => f.name.toLowerCase() === exactSearchName.toLowerCase()
    );
    setExactMatch(match || null);
  };

  const handleAddDocument = () => {
    if (!newDocument.name || !newDocument.type || !newDocument.file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const documentData = {
        id: crypto.randomUUID(),
        name: newDocument.name,
        type: newDocument.type,
        fileName: newDocument.file.name,
        data: e.target.result,
        uploadedAt: new Date().toISOString()
      };
      
      setTempDocuments(prev => [...prev, documentData]);
      setNewDocument({ name: '', type: '', file: null });
    };
    reader.readAsDataURL(newDocument.file);
  };

  const handleDeleteTempDocument = (docId) => {
    setTempDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleDeleteDocument = (facultyId, docId) => {
    setFacultyList(prev =>
      prev.map(f =>
        f.id === facultyId
          ? { ...f, documents: f.documents.filter(d => d.id !== docId) }
          : f
      )
    );
  };

  const downloadDocument = (document) => {
    const link = document.createElement('a');
    link.href = document.data;
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const DocumentPreview = ({ document, onDelete }) => (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
      <div className="flex items-center">
        <div className="mr-3 text-blue-500">
          {document.fileName.split('.').pop() === 'pdf' ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-medium text-sm">{document.name}</p>
          <p className="text-xs text-gray-500">{document.fileName}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => downloadDocument(document)}
          className="text-blue-600 hover:text-blue-800"
          title="Download"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        <button 
          onClick={() => onDelete(document.id)}
          className="text-red-600 hover:text-red-800"
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Faculty Management</h1>

      {/* 🔍 Exact Name Match */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search faculty by exact name..."
          value={exactSearchName}
          onChange={(e) => setExactSearchName(e.target.value)}
          className="p-2 border rounded w-full md:w-1/2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleExactSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>

      {/* Add/Edit Faculty Form */}
      <form onSubmit={handleAddOrUpdate} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editId ? 'Edit Faculty Member' : 'Add New Faculty Member'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {['name', 'email', 'department', 'designation'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field[0].toUpperCase() + field.slice(1)}
              </label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={field === 'name' || field === 'email'}
              />
            </div>
          ))}
        </div>

        {/* Document Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
              <input
                type="text"
                name="name"
                value={newDocument.name}
                onChange={handleDocumentChange}
                placeholder="e.g., PhD Certificate"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                name="type"
                value={newDocument.type}
                onChange={handleDocumentChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Type</option>
                <option value="Resume/CV">Resume/CV</option>
                <option value="Degree">Degree</option>
                <option value="Certificate">Certificate</option>
                <option value="ID Proof">ID Proof</option>
                <option value="Publication">Publication</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Upload</label>
              <div className="flex items-center">
                <label className="flex-1 p-2 border rounded-l cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <span className="text-sm text-gray-600 truncate">
                    {newDocument.file ? newDocument.file.name : 'Choose file...'}
                  </span>
                  <input
                    type="file"
                    name="file"
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAddDocument}
                  disabled={!newDocument.file}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Uploaded Documents Preview */}
          {tempDocuments.length > 0 && (
            <div className="border rounded p-3 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Documents to be attached:</h4>
              <div className="space-y-2">
                {tempDocuments.map(doc => (
                  <DocumentPreview 
                    key={doc.id} 
                    document={doc} 
                    onDelete={handleDeleteTempDocument} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setFormData({ name: '', email: '', department: '', designation: '' });
                setTempDocuments([]);
              }}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {editId ? 'Update Faculty' : 'Add Faculty'}
          </button>
        </div>
      </form>

      {/* 🎯 Exact Match Result */}
      {exactMatch && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-3 text-blue-800">Search Result</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{exactMatch.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{exactMatch.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium">{exactMatch.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-medium ${exactMatch.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                {exactMatch.status}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <button 
              onClick={() => setViewingDocumentsFor(exactMatch.id)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View {exactMatch.documents?.length || 0} documents
            </button>
          </div>
        </div>
      )}

      {/* Faculty Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Department', 'Status', 'Courses', 'Documents', 'Actions'].map((header) => (
                  <th 
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facultyList.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{f.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {f.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {f.department || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${f.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {Object.entries(f.courses).length === 0
                      ? 'None'
                      : Object.entries(f.courses)
                          .map(([sem, c]) => `${sem}: ${c.join(', ')}`)
                          .join(' | ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => setViewingDocumentsFor(f.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {f.documents?.length || 0}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(f)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setAssigningId(f.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Assign Courses"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(f.id)}
                        className={f.status === 'Active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                        title={f.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        {f.status === 'Active' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.828-2.828m0 0l5.658-5.657m-5.657 5.657l3.536-3.536" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </button>
                      <a
                        href={`mailto:${f.email}`}
                        className="text-green-600 hover:text-green-900"
                        title="Email"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                      <button 
                        onClick={() => handleDelete(f.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Assignment Modal */}
      {assigningId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Assign Courses to {facultyList.find(f => f.id === assigningId)?.name}
            </h2>
            <div className="space-y-4">
              {Object.entries(allCourses).map(([sem, courseList]) => (
                <div key={sem} className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{sem}</label>
                  <select
                    multiple
                    className="block w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={assignedCourses[sem] || []}
                    onChange={(e) =>
                      setAssignedCourses((prev) => ({
                        ...prev,
                        [sem]: Array.from(e.target.selectedOptions, (opt) => opt.value),
                      }))
                    }
                  >
                    {courseList.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setAssigningId(null)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignCourses}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {viewingDocumentsFor !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Documents for {facultyList.find(f => f.id === viewingDocumentsFor)?.name}
              </h2>
              <button
                onClick={() => setViewingDocumentsFor(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {facultyList.find(f => f.id === viewingDocumentsFor)?.documents?.length ? (
              <div className="space-y-3">
                {facultyList.find(f => f.id === viewingDocumentsFor)?.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="mr-4 text-blue-500">
                        {doc.fileName.split('.').pop() === 'pdf' ? (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.type}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.fileName}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => downloadDocument(doc)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Download"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteDocument(viewingDocumentsFor, doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                <p className="mt-1 text-sm text-gray-500">This faculty member doesn't have any documents yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;