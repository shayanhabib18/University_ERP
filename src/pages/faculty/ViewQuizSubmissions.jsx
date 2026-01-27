import { useState, useEffect } from "react";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  BookOpen,
  Trophy,
  User,
  Hash,
} from "lucide-react";
import quizAPI from "../../services/quizAPI";

export default function ViewQuizSubmissions() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadQuizzes();
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedQuiz) {
      loadSubmissions();
    }
  }, [selectedQuiz]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const token = localStorage.getItem("facultyToken");
      if (!token) {
        console.warn("No faculty token found");
        return;
      }

      const profileResp = await fetch("http://localhost:5000/faculties/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileResp.ok) {
        console.error("Failed to load faculty profile");
        return;
      }
      const profile = await profileResp.json();
      const facultyId = profile.id;

      const coursesResp = await fetch(
        `http://localhost:5000/faculty-courses/faculty/${facultyId}`
      );
      if (!coursesResp.ok) {
        console.error("Failed to load faculty courses");
        return;
      }
      const data = await coursesResp.json();
      const mapped = (data || [])
        .map((c) => ({
          id: c?.course?.id,
          code: c?.course?.code,
          name: c?.course?.name,
        }))
        .filter((c) => c.id);
      setCourses(mapped);
    } catch (error) {
      console.error("Error loading courses", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("facultyToken");
      const response = await fetch(
        `http://localhost:5000/quizzes/faculty`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to load quizzes");
        setQuizzes([]);
        return;
      }

      const result = await response.json();
      const allQuizzes = result.quizzes || [];
      
      // Filter quizzes by selected course
      const filteredQuizzes = allQuizzes.filter(q => q.course_id === selectedCourse);
      console.log("📚 Quizzes loaded:", { 
        total: allQuizzes.length, 
        filtered: filteredQuizzes.length,
        selectedCourse 
      });
      
      setQuizzes(filteredQuizzes);
      
      // Auto-select first quiz if available
      if (filteredQuizzes.length > 0 && !selectedQuiz) {
        setSelectedQuiz(filteredQuizzes[0].id);
      }
    } catch (error) {
      console.error("Error loading quizzes:", error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      console.log("🔍 Loading submissions for quiz:", selectedQuiz);
      const data = await quizAPI.getQuizSubmissions(selectedQuiz);
      console.log("📊 Submissions data received:", {
        count: data?.length || 0,
        sample: data?.[0] || null
      });
      setSubmissions(data || []);
    } catch (error) {
      console.error("❌ Error loading submissions:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score, totalMarks) => {
    if (!totalMarks) return "text-gray-600";
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const selectedQuizData = quizzes.find((q) => q.id === selectedQuiz);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <Trophy className="text-indigo-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quiz Submissions</h1>
            <p className="text-gray-600 text-sm">
              View student quiz attempts and scores
            </p>
          </div>
        </div>
      </div>

      {/* Course and Quiz Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Course Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen size={16} className="inline mr-2" />
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedQuiz("");
                setSubmissions([]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              disabled={loadingCourses}
            >
              <option value="">
                {loadingCourses ? "Loading courses..." : "Choose a course"}
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quiz Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Select Quiz
            </label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              disabled={!selectedCourse || quizzes.length === 0}
            >
              <option value="">
                {!selectedCourse
                  ? "Select a course first"
                  : quizzes.length === 0
                  ? "No quizzes available"
                  : "Choose a quiz"}
              </option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title || `Quiz #${quiz.quiz_number || quiz.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quiz Info */}
        {selectedQuizData && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Quiz Number:</span>
                <span className="ml-2 text-gray-900">
                  {selectedQuizData.quiz_number || "N/A"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total Marks:</span>
                <span className="ml-2 text-gray-900">
                  {selectedQuizData.total_marks || "N/A"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total Submissions:</span>
                <span className="ml-2 text-indigo-700 font-bold">
                  {submissions.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && selectedQuiz && (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        )}

        {!loading && selectedQuiz && submissions.length === 0 && (
          <div className="p-8 text-center">
            <Clock size={48} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              No Submissions Yet
            </h3>
            <p className="text-gray-500 text-sm">
              Students haven't submitted this quiz yet
            </p>
          </div>
        )}

        {!loading && !selectedQuiz && (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Select a Quiz
            </h3>
            <p className="text-gray-500 text-sm">
              Choose a course and quiz to view submissions
            </p>
          </div>
        )}

        {!loading && submissions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    <User size={14} className="inline mr-1" />
                    Student Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    <Hash size={14} className="inline mr-1" />
                    Roll No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    <BookOpen size={14} className="inline mr-1" />
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    <FileText size={14} className="inline mr-1" />
                    Quiz No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    <Trophy size={14} className="inline mr-1" />
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    <Clock size={14} className="inline mr-1" />
                    Submitted At
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((sub, index) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {sub.student_name || sub.student?.full_name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sub.student_roll_no || sub.student?.roll_number || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {selectedQuizData?.course_name || 
                       selectedQuizData?.course?.name || 
                       courses.find(c => c.id === selectedCourse)?.name ||
                       "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {selectedQuizData?.quiz_number || "N/A"}
                    </td>
                    <td className={`px-4 py-3 text-sm font-bold ${getScoreColor(sub.score, selectedQuizData?.total_marks)}`}>
                      {sub.score || 0} / {selectedQuizData?.total_marks || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(sub.submitted_at || sub.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle size={12} />
                        Submitted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
