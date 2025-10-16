import { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  Share2, 
  UploadCloud, 
  Upload, 
  BookOpen,
  Calendar,
  Zap,
  Download,
  CheckCircle,
  ArrowRight,
  Brain,
  FileCheck,
  Clock
} from "lucide-react";

const AiQuizAssignmentForm = () => {
  const [form, setForm] = useState({
    course: "",
    type: "mcq",
    topic: "",
    file: null,
  });

  const [assignment, setAssignment] = useState({
    course: "",
    deadline: "",
    file: null,
  });

  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("quiz");

  const courses = [
    { id: "CS101", name: "Introduction to Programming", color: "indigo" },
    { id: "CS201", name: "Data Structures & Algorithms", color: "blue" },
    { id: "CS301", name: "Operating Systems", color: "emerald" },
    { id: "CS401", name: "Database Systems", color: "amber" },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAssignmentChange = (e) => {
    const { name, value, files } = e.target;
    setAssignment((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleGenerate = async () => {
    if (!form.course || !form.topic) {
      alert("Please select a course and enter a topic");
      return;
    }

    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));

    const mockData = form.type === "mcq"
      ? [
          {
            question: "What is the time complexity of binary search algorithm?",
            options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            correct: 1,
            explanation:
              "Binary search divides the search space in half each time, leading to logarithmic time complexity.",
          },
          {
            question: "Which data structure uses LIFO (Last-In-First-Out) principle?",
            options: ["Queue", "Stack", "Array", "Linked List"],
            correct: 1,
            explanation:
              "Stack follows LIFO principle where the last element added is the first one to be removed.",
          },
        ]
      : [
          {
            question:
              "Explain the difference between stack and queue data structures with real-world examples.",
            points: ["LIFO vs FIFO", "Use cases", "Implementation differences"],
            marks: 10,
          },
        ];

    setGeneratedQuestions(mockData);
    setIsGenerating(false);
  };

  const handleShare = () => {
    alert("✅ Question paper shared with students successfully!");
  };

  const handleAssignmentSubmit = () => {
    if (!assignment.course || !assignment.deadline || !assignment.file) {
      alert("Please fill all assignment fields!");
      return;
    }

    const courseName = courses.find((c) => c.id === assignment.course)?.name;
    alert(
      `✅ Assignment uploaded for ${courseName}\n📅 Due: ${new Date(
        assignment.deadline
      ).toLocaleDateString()}`
    );
  };

  const handleDownload = () => {
    alert("Downloading generated questions as PDF...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "quiz"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Sparkles size={20} />
              AI Quiz Generator
            </button>
            <button
              onClick={() => setActiveTab("assignment")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "assignment"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileCheck size={20} />
              Assignment Upload
            </button>
          </div>
        </div>

        {/* Main Panel */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {activeTab === "quiz" && (
            <div>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Brain className="text-white" size={26} />
                  <div>
                    <h2 className="text-2xl font-bold">AI Quiz Generator</h2>
                    <p className="text-indigo-100 text-sm">
                      Generate intelligent quizzes from your course materials
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Course Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <BookOpen className="inline w-4 h-4 mr-2" />
                    Select Course
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, course: course.id }))
                        }
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.course === course.id
                            ? `border-${course.color}-500 bg-${course.color}-50 shadow-sm`
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-semibold text-gray-900">
                          {course.id}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {course.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quiz Type and Topic */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quiz Type
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                      <option value="mcq">Multiple Choice Questions</option>
                      <option value="descriptive">Descriptive Questions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Zap className="inline w-4 h-4 mr-2" />
                      Topic
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={form.topic}
                      onChange={handleChange}
                      placeholder="e.g., Binary Search, OOP Principles..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UploadCloud className="inline w-4 h-4 mr-2" />
                    Lecture Materials (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                    <UploadCloud
                      className="mx-auto text-gray-400 mb-3"
                      size={32}
                    />
                    <p className="text-gray-600 mb-2">
                      Drag & drop your lecture slides or notes
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports PDF, PPT, DOC (Max 10MB)
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      <Upload size={16} />
                      Choose Files
                      <input
                        type="file"
                        accept=".pdf,.ppt,.doc,.docx"
                        name="file"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !form.course || !form.topic}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                    isGenerating || !form.course || !form.topic
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      AI is generating your quiz...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles size={20} />
                      Generate Smart Quiz
                      <ArrowRight size={20} />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Assignment Upload */}
          {activeTab === "assignment" && (
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <FileCheck size={26} />
                  <div>
                    <h2 className="text-2xl font-bold">Assignment Upload</h2>
                    <p className="text-blue-100 text-sm">
                      Upload and share assignments with students
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BookOpen className="inline w-4 h-4 mr-2" />
                      Course
                    </label>
                    <select
                      name="course"
                      value={assignment.course}
                      onChange={handleAssignmentChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.id} - {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Submission Deadline
                    </label>
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={assignment.deadline}
                      onChange={handleAssignmentChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UploadCloud className="inline w-4 h-4 mr-2" />
                    Assignment File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <FileText className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-600 mb-2">
                      Upload assignment instructions
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      PDF format recommended
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Upload size={16} />
                      Choose Assignment File
                      <input
                        type="file"
                        accept=".pdf"
                        name="file"
                        onChange={handleAssignmentChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleAssignmentSubmit}
                  disabled={
                    !assignment.course || !assignment.deadline || !assignment.file
                  }
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                    !assignment.course || !assignment.deadline || !assignment.file
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Upload size={20} />
                    Upload Assignment
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Generated Questions */}
        {generatedQuestions && activeTab === "quiz" && (
          <div className="mt-10 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={24} />
                  <div>
                    <h2 className="text-2xl font-bold">Generated Questions</h2>
                    <p className="text-green-100">
                      {form.type === "mcq"
                        ? "Multiple Choice Questions"
                        : "Descriptive Questions"}{" "}
                      • {generatedQuestions.length} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Download as PDF"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-white/90 transition-colors font-medium"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {generatedQuestions.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-green-200 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 text-lg mb-3">
                    {index + 1}. {item.question}
                  </h3>
                  {form.type === "mcq" ? (
                    <div className="space-y-2">
                      {item.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${
                            i === item.correct
                              ? "bg-green-50 border-green-300 text-green-800"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="font-medium text-yellow-800 mb-2">
                        Key Points:
                      </p>
                      <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                        {item.points.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiQuizAssignmentForm;
