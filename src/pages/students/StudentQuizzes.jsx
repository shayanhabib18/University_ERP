import { useState, useEffect } from "react";
import { CheckCircle, Clock, FileText, Brain, Award } from "lucide-react";

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadAvailableQuizzes();
  }, []);

  const loadAvailableQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Get student's courses
      const studentResp = await fetch("http://localhost:5000/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!studentResp.ok) {
        console.error("Failed to load student profile");
        return;
      }
      
      const studentData = await studentResp.json();
      
      // In a real implementation, you would fetch quizzes based on student's enrolled courses
      // For now, we'll fetch all shared quizzes
      const quizzesResp = await fetch("http://localhost:5000/quizzes/student/available", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (quizzesResp.ok) {
        const data = await quizzesResp.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error("Error loading quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setAnswers({});
    setResult(null);
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length !== selectedQuiz.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/quizzes/${selectedQuiz.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: Object.values(answers) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit quiz");
      }

      const data = await response.json();
      setResult(data);
      alert(`✅ Quiz submitted! Your score: ${data.score}/${data.totalQuestions} (${data.percentage}%)`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const backToList = () => {
    setSelectedQuiz(null);
    setAnswers({});
    setResult(null);
    loadAvailableQuizzes();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (selectedQuiz && !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>
                  <p className="text-blue-100">
                    {selectedQuiz.type === "mcq" ? "Multiple Choice" : "Descriptive"} • {selectedQuiz.questions.length} Questions
                  </p>
                </div>
                <Brain size={32} />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {selectedQuiz.questions.map((question, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">
                    {index + 1}. {question.question}
                  </h3>

                  {selectedQuiz.type === "mcq" ? (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                            answers[index] === optIndex
                              ? "bg-blue-100 border-blue-500"
                              : "bg-white border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            checked={answers[index] === optIndex}
                            onChange={() => handleAnswerChange(index, optIndex)}
                            className="mr-3"
                          />
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[index] || ""}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={6}
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-4">
                <button
                  onClick={backToList}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
              <Award size={48} className="mx-auto mb-4" />
              <h2 className="text-3xl font-bold">Quiz Completed!</h2>
              <p className="text-green-100 text-lg mt-2">
                Your Score: {result.score}/{result.totalQuestions} ({result.percentage}%)
              </p>
            </div>

            <div className="p-6 space-y-6">
              {result.results.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-6 border-2 ${
                    item.isCorrect
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle
                      className={item.isCorrect ? "text-green-600" : "text-red-600"}
                      size={24}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {index + 1}. {item.question}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Your answer:</strong> {String.fromCharCode(65 + item.userAnswer)}
                      </p>
                      {!item.isCorrect && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Correct answer:</strong> {String.fromCharCode(65 + item.correctAnswer)}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg">
                        <strong>Explanation:</strong> {item.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={backToList}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Quizzes</h1>
          <p className="text-gray-600">Complete quizzes assigned by your instructors</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Quizzes Available</h3>
            <p className="text-gray-500">Check back later for new quizzes from your instructors</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                  <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                  <p className="text-blue-100 text-sm">{quiz.course?.name || "Course"}</p>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText size={16} />
                      <span className="text-sm">
                        {quiz.questions.length} Questions • {quiz.type === "mcq" ? "MCQ" : "Descriptive"}
                      </span>
                    </div>
                    {quiz.deadline && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        <span className="text-sm">
                          Due: {new Date(quiz.deadline).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => startQuiz(quiz)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizzes;
