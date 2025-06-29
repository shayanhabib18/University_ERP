import React, { useState, useEffect } from "react";
import {
  Download,
  Upload,
  Clock,
  CheckCircle,
  FileText,
  BookOpen,
  XCircle,
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
    submission: null,
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
    submission: "my_oop_project.zip",
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
    fileUrl: "/files/quiz1.pdf",
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
    fileUrl: "/files/quiz2.pdf",
  },
];

export default function AssignmentsQuizzes() {
  const [activeTab, setActiveTab] = useState("assignments");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [quizModal, setQuizModal] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const handleDownload = (url) => {
    window.open(url, "_blank");
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = (assignmentId) => {
    setUploading(true);
    setTimeout(() => {
      alert(`File ${selectedFile.name} uploaded for assignment ${assignmentId}`);
      setUploading(false);
      setSelectedFile(null);
    }, 1500);
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizModal(true);
    document.documentElement.requestFullscreen?.();
  };

  const handleEndQuiz = () => {
    alert("Quiz ended due to tab switch or manual exit.");
    document.exitFullscreen?.();
    setQuizModal(false);
    setActiveQuiz(null);
  };

  useEffect(() => {
    const preventCopyPaste = (e) => e.preventDefault();
    const preventRightClick = (e) => e.preventDefault();
    const detectTabSwitch = () => {
      if (document.hidden) handleEndQuiz();
    };

    if (quizModal) {
      window.addEventListener("blur", handleEndQuiz);
      document.addEventListener("copy", preventCopyPaste);
      document.addEventListener("cut", preventCopyPaste);
      document.addEventListener("paste", preventCopyPaste);
      document.addEventListener("contextmenu", preventRightClick);
      document.addEventListener("visibilitychange", detectTabSwitch);
    }

    return () => {
      window.removeEventListener("blur", handleEndQuiz);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("visibilitychange", detectTabSwitch);
    };
  }, [quizModal]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText size={24} className="text-blue-600" />
          Assignments & Quizzes
        </h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
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

      {/* Assignments */}
      {activeTab === "assignments" &&
        mockAssignments.map((a) => (
          <div
            key={a.id}
            className="border p-6 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow mb-6"
          >
            <div className="flex flex-col md:flex-row md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-600">{a.course}</p>
                <p className="text-sm mt-3">{a.description}</p>
                <p className="text-sm mt-2 text-gray-600">
                  Due: {a.dueDate}
                </p>
                {a.grade && (
                  <p className="text-green-600 mt-1">Grade: {a.grade}</p>
                )}
                <button
                  onClick={() => handleDownload(a.fileUrl)}
                  className="mt-4 text-blue-600 hover:underline text-sm"
                >
                  <Download size={14} className="inline mr-1" />
                  Download Assignment
                </button>
              </div>
              {a.status === "Pending" ? (
                <div className="md:w-56">
                  <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded cursor-pointer hover:bg-blue-50 transition-colors">
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
                    className={`mt-3 px-4 py-2 rounded text-white w-full ${
                      !selectedFile || uploading
                        ? "bg-gray-400"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {uploading ? "Uploading..." : "Submit"}
                  </button>
                </div>
              ) : (
                <div className="text-green-700 font-medium">Submitted</div>
              )}
            </div>
          </div>
        ))}

      {/* Quizzes */}
      {activeTab === "quizzes" &&
        mockQuizzes.map((q) => (
          <div
            key={q.id}
            className="border p-6 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow mb-6"
          >
            <div className="flex flex-col md:flex-row md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{q.title}</h3>
                <p className="text-sm text-gray-600">{q.course}</p>
                <p className="text-sm mt-3">{q.description}</p>
                <div className="mt-2 text-gray-600 text-sm">
                  Date: {q.date} | Duration: {q.duration}
                </div>
                {/* {q.grade && (
                  <p className="text-green-600 mt-1">Grade: {q.grade}</p>
                )} */}
              </div>
              <div className="md:w-56">
                {q.status === "Upcoming" ? (
                  <button
                    onClick={() => handleStartQuiz(q)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Start Quiz
                  </button>
                ) : (
                  <div className="text-green-700 font-medium">Completed</div>
                )}
              </div>
            </div>
          </div>
        ))}

      {/* Fullscreen Quiz Modal */}
      {quizModal && activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 text-white flex flex-col items-center justify-center p-8">
          <button
            onClick={handleEndQuiz}
            className="absolute top-4 right-4 text-white hover:text-red-500"
          >
            <XCircle size={28} />
          </button>
          <h2 className="text-3xl font-bold mb-6">{activeQuiz.title}</h2>
          <p className="text-lg text-center max-w-3xl mb-6">
            {/* Replace below with actual quiz questions */}
            This is a mock quiz window. Implement MCQs or descriptive
            questions here.
          </p>
          <button
            onClick={handleEndQuiz}
            className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white"
          >
            Finish Quiz
          </button>
        </div>
      )}
    </div>
  );
}
