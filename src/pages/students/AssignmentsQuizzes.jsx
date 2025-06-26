import React, { useState } from "react";
import { 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  BookOpen,
  ChevronRight
} from "lucide-react";

const mockAssignments = [
  {
    id: "A1",
    title: "Data Structures Implementation",
    course: "CS240 - Information Security",
    dueDate: "2025-07-05",
    status: "Pending",
    grade: null,
    description: "Implement basic data structures in Java and analyze time complexity",
    fileUrl: "/files/assignment1.pdf",
    submission: null
  },
  {
    id: "A2",
    title: "OOP Principles Project",
    course: "CS210 - Object Oriented Programming",
    dueDate: "2025-07-10",
    status: "Submitted",
    grade: "B+",
    description: "Demonstrate OOP principles through a small application",
    fileUrl: "/files/assignment2.pdf",
    submission: "my_oop_project.zip"
  },
];

const mockQuizzes = [
  {
    id: "Q1",
    title: "Computer Networks Fundamentals",
    course: "CS320 - Computer Networks",
    date: "2025-06-28",
    status: "Upcoming",
    grade: null,
    description: "Covering TCP/IP protocols and network architectures",
    duration: "30 minutes",
    fileUrl: "/files/quiz1.pdf"
  },
  {
    id: "Q2",
    title: "Database Management Systems",
    course: "CS310 - Database Systems",
    date: "2025-06-15",
    status: "Completed",
    grade: "A",
    description: "SQL queries and normalization concepts",
    duration: "45 minutes",
    fileUrl: "/files/quiz2.pdf"
  },
];

export default function AssignmentsQuizzes() {
  const [activeTab, setActiveTab] = useState("assignments");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleDownload = (url) => {
    // In a real app, this would trigger file download
    console.log(`Downloading file from ${url}`);
    window.open(url, '_blank');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = (assignmentId) => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      alert(`File ${selectedFile.name} uploaded for assignment ${assignmentId}`);
      setUploading(false);
      setSelectedFile(null);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText size={24} className="text-blue-600" />
          Assignments & Quizzes
        </h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-6 py-3 font-medium flex items-center gap-2 relative ${
            activeTab === "assignments"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText size={18} />
          Assignments
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full ml-1">
            {mockAssignments.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`px-6 py-3 font-medium flex items-center gap-2 relative ${
            activeTab === "quizzes"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen size={18} />
          Quizzes
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full ml-1">
            {mockQuizzes.length}
          </span>
        </button>
      </div>

      {/* Assignments Section */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {mockAssignments.map((a) => (
            <div
              key={a.id}
              className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{a.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{a.course}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      a.status === "Pending" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {a.status === "Pending" ? <Clock size={14} className="mr-1" /> : <CheckCircle size={14} className="mr-1" />}
                      {a.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-3">{a.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-1 text-gray-500" />
                      Due: {a.dueDate}
                    </div>
                    {a.grade && (
                      <div className="flex items-center text-sm font-medium text-green-700">
                        <CheckCircle size={14} className="mr-1" />
                        Grade: {a.grade}
                      </div>
                    )}
                  </div>
                  
                  {a.fileUrl && (
                    <button 
                      onClick={() => handleDownload(a.fileUrl)}
                      className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Download size={14} className="mr-1" />
                      Download Assignment Document
                    </button>
                  )}
                </div>
                
                {a.status === "Pending" ? (
                  <div className="md:w-56 flex flex-col gap-3">
                    <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-300 cursor-pointer hover:bg-blue-50 transition-colors">
                      <Upload size={16} className="mr-1" />
                      {selectedFile ? selectedFile.name : "Select File"}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                    <button 
                      onClick={() => handleUpload(a.id)}
                      disabled={!selectedFile || uploading}
                      className={`px-4 py-2 rounded-lg text-white flex items-center justify-center ${
                        !selectedFile || uploading 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {uploading ? "Uploading..." : "Submit Assignment"}
                    </button>
                  </div>
                ) : a.submission && (
                  <div className="md:w-56 flex flex-col items-end justify-center">
                    <div className="text-sm font-medium text-green-700 flex items-center">
                      <CheckCircle size={16} className="mr-1" />
                      Submitted
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {a.submission}
                    </div>
                    {a.grade && (
                      <div className="text-xs text-gray-500 mt-1">
                        Graded on {a.dueDate}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quizzes Section */}
      {activeTab === "quizzes" && (
        <div className="space-y-6">
          {mockQuizzes.map((q) => (
            <div
              key={q.id}
              className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{q.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{q.course}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      q.status === "Upcoming" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {q.status === "Upcoming" ? <Clock size={14} className="mr-1" /> : <CheckCircle size={14} className="mr-1" />}
                      {q.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-3">{q.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-1 text-gray-500" />
                      Date: {q.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-1 text-gray-500" />
                      Duration: {q.duration}
                    </div>
                    {q.grade && (
                      <div className="flex items-center text-sm font-medium text-green-700">
                        <CheckCircle size={14} className="mr-1" />
                        Grade: {q.grade}
                      </div>
                    )}
                  </div>
                  
                  {q.fileUrl && (
                    <button 
                      onClick={() => handleDownload(q.fileUrl)}
                      className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Download size={14} className="mr-1" />
                      Download Quiz Materials
                    </button>
                  )}
                </div>
                
                {q.status === "Upcoming" ? (
                  <button className="md:w-56 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center">
                    <Clock size={16} className="mr-2" />
                    Starts Soon
                  </button>
                ) : (
                  <div className="md:w-56 flex flex-col items-end justify-center">
                    <div className="text-sm font-medium text-green-700 flex items-center">
                      <CheckCircle size={16} className="mr-1" />
                      Completed
                    </div>
                    {q.grade && (
                      <div className="text-xs text-gray-500 mt-1">
                        Graded on {q.date}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}