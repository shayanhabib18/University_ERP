import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Upload,
  Clock,
  CheckCircle,
  FileText,
  BookOpen,
  XCircle,
} from "lucide-react";
import assignmentAPI from "../../services/assignmentAPI";
import quizAPI from "../../services/quizAPI";

export default function AssignmentsQuizzes() {
  const [activeTab, setActiveTab] = useState("assignments");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [quizModal, setQuizModal] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const antiCheatArmedRef = useRef(false);

  useEffect(() => {
    fetchAssignments();
    fetchQuizzes();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await assignmentAPI.getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const data = await quizAPI.getStudentQuizzes();
      console.log("Fetched quizzes:", data);
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setQuizzes([]);
    }
  };

  const handleDownload = (url) => {
    if (url) {
      // If URL is already absolute (Supabase Storage), use it directly
      // Otherwise prepend localhost for local files
      const downloadUrl = url.startsWith("http") ? url : `http://localhost:5000${url}`;
      window.open(downloadUrl, "_blank");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (assignmentId, deadline) => {
    // Check if deadline has passed
    if (new Date(deadline) < new Date()) {
      alert("⚠️ Deadline has passed. You cannot submit this assignment.");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      await assignmentAPI.submitAssignment(assignmentId, selectedFile);
      alert(`✅ File ${selectedFile.name} uploaded successfully!`);
      setSelectedFile(null);
      fetchAssignments(); // Refresh to show updated status
    } catch (err) {
      console.error("Error uploading file:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  // Format date and time for display
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizModal(true);
    // Initialize answers based on quiz type
    const initialAnswers = Array.from({ length: quiz.questions?.length || quiz.total_questions || 0 }, () =>
      quiz.type === "mcq" ? null : ""
    );
    setAnswers(initialAnswers);
    setCurrentQuestionIndex(0);
    // Set timer in seconds if duration provided
    if (quiz.duration_minutes) {
      setTimeLeft(quiz.duration_minutes * 60);
    } else {
      setTimeLeft(null);
    }
    document.documentElement.requestFullscreen?.();
  };

  const handleEndQuiz = () => {
    alert("Quiz ended due to tab switch or manual exit.");
    document.exitFullscreen?.();
    setQuizModal(false);
    setActiveQuiz(null);
  };

  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    const handleVisibilityChange = () => {
      if (antiCheatArmedRef.current && document.hidden) {
        handleEndQuiz();
      }
    };

    let armingTimer;
    if (quizModal) {
      // Give a short grace period after opening the quiz
      // to avoid false positives from focus transitions.
      armingTimer = setTimeout(() => {
        antiCheatArmedRef.current = true;
      }, 1500);

      document.addEventListener("copy", preventDefault);
      document.addEventListener("cut", preventDefault);
      document.addEventListener("paste", preventDefault);
      document.addEventListener("contextmenu", preventDefault);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      clearTimeout(armingTimer);
      antiCheatArmedRef.current = false;
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("paste", preventDefault);
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [quizModal]);

  // Countdown timer for quiz
  useEffect(() => {
    if (!quizModal || !timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time ends
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizModal, timeLeft]);

  const handleSelectOption = (index) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = index;
      return next;
    });
  };

  const handleTextAnswerChange = (text) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = text;
      return next;
    });
  };

  const handleNext = () => {
    setCurrentQuestionIndex((i) => Math.min(i + 1, (activeQuiz?.questions?.length || 1) - 1));
  };

  const handlePrev = () => {
    setCurrentQuestionIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      const resp = await quizAPI.submitQuizAnswer(activeQuiz.id, answers);
      alert(`Quiz submitted! Score: ${resp.score}/${resp.totalQuestions} (${resp.percentage}%)`);
      // Exit quiz and refresh quizzes list to show submission
      document.exitFullscreen?.();
      setQuizModal(false);
      setActiveQuiz(null);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setTimeLeft(null);
      fetchQuizzes();
    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert(`Failed to submit quiz: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

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
            {assignments.length}
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
            {quizzes.length}
          </span>
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      )}

      {/* Assignments */}
      {!loading && activeTab === "assignments" && assignments.length > 0 &&
        assignments.map((a) => {
          const deadlinePassed = isDeadlinePassed(a.dueDate);
          const canSubmit = a.status === "Pending" && !deadlinePassed;
          
          return (
            <div
              key={a.id}
              className={`border p-6 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow mb-6 ${
                deadlinePassed && a.status === "Pending" ? "opacity-75 border-red-200" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{a.title}</h3>
                    {deadlinePassed && a.status === "Pending" && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                        EXPIRED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{a.course}</p>
                  <p className="text-sm mt-3">{a.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Clock size={14} className={deadlinePassed ? "text-red-500" : "text-gray-500"} />
                    <p className={`text-sm font-medium ${deadlinePassed ? "text-red-600" : "text-gray-700"}`}>
                      Due: {formatDateTime(a.dueDate)}
                    </p>
                  </div>
                  {deadlinePassed && a.status === "Pending" && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      🔒 Submission locked - Deadline has passed
                    </p>
                  )}
                  {a.submissionDate && (
                    <p className="text-sm text-green-600 mt-2">
                      <CheckCircle size={14} className="inline mr-1" />
                      Submitted on: {formatDateTime(a.submissionDate)}
                    </p>
                  )}
                  {a.grade && (
                    <p className="text-green-600 mt-1 font-medium">Grade: {a.grade}</p>
                  )}
                  {a.fileUrl && (
                    <button
                      onClick={() => handleDownload(a.fileUrl)}
                      className="mt-4 text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      <Download size={14} />
                      Download Assignment File
                    </button>
                  )}
                </div>
                {a.status === "Pending" ? (
                  <div className="md:w-56">
                    <label className={`flex flex-col items-center px-4 py-2 bg-white border rounded ${
                      canSubmit 
                        ? "text-blue-600 border-blue-300 cursor-pointer hover:bg-blue-50" 
                        : "text-gray-400 border-gray-300 cursor-not-allowed bg-gray-50"
                    } transition-colors`}>
                      <Upload size={16} className="mr-1" />
                      {selectedFile ? selectedFile.name : "Select File"}
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={!canSubmit}
                      />
                    </label>
                    <button
                      onClick={() => handleUpload(a.id, a.dueDate)}
                      disabled={!selectedFile || uploading || !canSubmit}
                      className={`mt-3 px-4 py-2 rounded text-white w-full ${
                        !selectedFile || uploading || !canSubmit
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      title={!canSubmit ? "Deadline has passed" : ""}
                    >
                      {uploading ? "Uploading..." : deadlinePassed ? "Locked" : "Submit"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <div className="text-green-700 font-medium flex items-center gap-2">
                      <CheckCircle size={20} />
                      Submitted
                    </div>
                    {a.submissionFile && (
                      <button
                        onClick={() => handleDownload(a.submissionFile)}
                        className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Download size={12} />
                        View Submission
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

      {!loading && activeTab === "assignments" && assignments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No assignments available
        </div>
      )}

      {/* Quizzes */}
      {activeTab === "quizzes" && quizzes.length > 0 &&
        quizzes.map((q) => {
          const deadlinePassed = q.deadline && new Date(q.deadline) < new Date();
          const canAttempt = !q.isSubmitted && !deadlinePassed;
          
          return (
            <div
              key={q.id}
              className={`border p-6 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow mb-6 ${
                deadlinePassed && !q.isSubmitted ? "opacity-75 border-red-200" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{q.title}</h3>
                  <p className="text-sm text-gray-600">
                    {q.course?.name} ({q.course?.code})
                  </p>
                  {q.description && (
                    <p className="text-sm mt-3 text-gray-700">{q.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {q.duration_minutes} minutes
                    </span>
                    <span>Type: {q.type?.toUpperCase()}</span>
                    <span>{q.total_questions} questions</span>
                    <span>Passing: {q.passing_score}%</span>
                  </div>
                  {q.deadline && (
                    <div className={`mt-2 text-sm ${deadlinePassed ? "text-red-600" : "text-gray-600"}`}>
                      <Clock size={14} className="inline mr-1" />
                      Deadline: {formatDateTime(q.deadline)}
                      {deadlinePassed && " (Expired)"}
                    </div>
                  )}
                  {q.isSubmitted && q.submission && (
                    <div className="mt-3 flex items-center gap-2 text-green-700">
                      <CheckCircle size={16} />
                      <span className="font-medium">
                        Score: {q.submission.score}/{q.submission.total_questions} (
                        {((q.submission.score / q.submission.total_questions) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
                <div className="md:w-56">
                  {q.isSubmitted ? (
                    <div className="text-green-700 font-medium flex flex-col items-center gap-2">
                      <CheckCircle size={24} />
                      <span>Submitted</span>
                      <span className="text-sm text-gray-600">
                        {formatDateTime(q.submission.submitted_at)}
                      </span>
                    </div>
                  ) : deadlinePassed ? (
                    <div className="text-red-600 font-medium text-center">
                      <XCircle size={24} className="mx-auto mb-2" />
                      Deadline Passed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(q)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <BookOpen size={18} />
                      Start Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      {activeTab === "quizzes" && quizzes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No quizzes available
        </div>
      )}

      {/* Fullscreen Quiz Modal */}
      {quizModal && activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 text-white flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{activeQuiz.title}</h2>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className="text-sm bg-white bg-opacity-10 px-3 py-1 rounded">
                  Time left: {Math.floor(timeLeft / 60)}:{(`${timeLeft % 60}`).padStart(2, "0")}
                </div>
              )}
              <button
                onClick={handleEndQuiz}
                className="text-white hover:text-red-500"
                title="Exit quiz"
              >
                <XCircle size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 max-w-4xl w-full mx-auto bg-gray-900 bg-opacity-40 rounded-lg p-6">
            {activeQuiz.questions && activeQuiz.questions.length > 0 ? (
              <div>
                <div className="mb-4 text-sm text-gray-300">
                  Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                </div>
                {activeQuiz.type === "mcq" ? (
                  <div>
                    <div className="text-lg font-semibold mb-4">
                      {activeQuiz.questions[currentQuestionIndex]?.question}
                    </div>
                    <div className="space-y-3">
                      {activeQuiz.questions[currentQuestionIndex]?.options?.map((opt, idx) => (
                        <label key={idx} className={`flex items-center gap-3 p-3 rounded border ${answers[currentQuestionIndex] === idx ? "border-blue-400 bg-blue-900 bg-opacity-20" : "border-gray-700"}`}>
                          <input
                            type="radio"
                            name={`q-${currentQuestionIndex}`}
                            checked={answers[currentQuestionIndex] === idx}
                            onChange={() => handleSelectOption(idx)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-lg font-semibold mb-4">
                      {activeQuiz.questions[currentQuestionIndex]?.question}
                    </div>
                    <textarea
                      className="w-full h-40 p-3 rounded bg-gray-800 text-white border border-gray-700"
                      placeholder="Write your answer here..."
                      value={answers[currentQuestionIndex] || ""}
                      onChange={(e) => handleTextAnswerChange(e.target.value)}
                    />
                    {activeQuiz.questions[currentQuestionIndex]?.points && (
                      <div className="mt-3 text-sm text-gray-300">
                        <div className="font-medium">Key points to cover:</div>
                        <ul className="list-disc ml-5">
                          {activeQuiz.questions[currentQuestionIndex].points.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">No questions found.</div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between max-w-4xl w-full mx-auto">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded ${currentQuestionIndex === 0 ? "bg-gray-700 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"}`}
            >
              Previous
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex >= (activeQuiz.questions?.length || 1) - 1}
                className={`px-4 py-2 rounded ${currentQuestionIndex >= (activeQuiz.questions?.length || 1) - 1 ? "bg-gray-700 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"}`}
              >
                Next
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className={`px-4 py-2 rounded ${submitting ? "bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
