import { useState, useEffect } from "react";
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
import assignmentAPI from "../../services/assignmentAPI";

const AiQuizAssignmentForm = () => {
  const [form, setForm] = useState({
    course: "",
    type: "mcq",
    aiPrompt: "",
    description: "",
    durationMinutes: 60,
    totalQuestions: 10,
    passingScore: 50,
    deadline: "",
  });

  const [assignment, setAssignment] = useState({
    course: "",
    deadline: "",
    file: null,
  });

  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("quiz");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        const token = localStorage.getItem("facultyToken");
        if (!token) {
          console.warn("No faculty token found");
          setLoadingCourses(false);
          return;
        }

        const profileResp = await fetch("http://localhost:5000/faculties/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileResp.ok) {
          console.error("Failed to load faculty profile");
          setLoadingCourses(false);
          return;
        }
        const profile = await profileResp.json();
        const facultyId = profile.id;

        const coursesResp = await fetch(`http://localhost:5000/faculty-courses/faculty/${facultyId}`);
        if (!coursesResp.ok) {
          console.error("Failed to load faculty courses");
          setLoadingCourses(false);
          return;
        }
        const data = await coursesResp.json();
        const mapped = (data || []).map((c) => ({
          id: c?.course?.id,
          code: c?.course?.code,
          name: c?.course?.name,
        })).filter(c => c.id);
        setCourses(mapped);
      } catch (error) {
        console.error("Error loading courses", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

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
    if (!form.course || !form.aiPrompt) {
      alert("Please select a course and enter AI instructions");
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem("facultyToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        setIsGenerating(false);
        return;
      }

      const response = await fetch("http://localhost:5000/quizzes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: form.course,
          type: form.type,
          aiPrompt: form.aiPrompt,
          description: form.description,
          durationMinutes: parseInt(form.durationMinutes),
          totalQuestions: parseInt(form.totalQuestions),
          passingScore: parseInt(form.passingScore),
          deadline: form.deadline || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const data = await response.json();
      setGeneratedQuestions(data.questions);

      alert(`✅ ${data.message}\n\n📊 Questions: ${data.questions.length}\n⏱️ Duration: ${form.durationMinutes} min\n✅ Passing: ${form.passingScore}%`);
      
      // Reset form
      setForm({
        course: "",
        type: "mcq",
        aiPrompt: "",
        description: "",
        durationMinutes: 60,
        totalQuestions: 10,
        passingScore: 50,
        deadline: "",
      });
      setGeneratedQuestions(null);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    alert("Quiz has been published to students. They can now access it from their portal.");
  };

  const handleAssignmentSubmit = async () => {
    if (!assignment.course || !assignment.deadline || !assignment.file) {
      alert("Please fill all assignment fields!");
      return;
    }

    try {
      const courseName = courses.find((c) => c.id === assignment.course)?.name || "Course";
      
      await assignmentAPI.createAssignment(
        {
          courseId: assignment.course,
          title: `Assignment - ${courseName}`,
          description: "Assignment uploaded from faculty portal",
          deadline: assignment.deadline,
        },
        assignment.file
      );

      alert(
        `✅ Assignment uploaded for ${courseName}\n📅 Due: ${new Date(
          assignment.deadline
        ).toLocaleDateString()}`
      );
      
      // Reset form
      setAssignment({
        course: "",
        deadline: "",
        file: null,
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"][name="file"]');
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert(`❌ Error uploading assignment: ${error.message}`);
    }
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
                  <select
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    disabled={loadingCourses || courses.length === 0}
                  >
                    <option value="">{loadingCourses ? "Loading courses..." : "Select a course"}</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code ? `${course.code} - ` : ""}{course.name}
                      </option>
                    ))}
                  </select>
                  {(!loadingCourses && courses.length === 0) && (
                    <p className="text-sm text-gray-500 mt-2">No courses assigned to you yet.</p>
                  )}
                </div>

                {/* Quiz Type */}
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
                    <option value="mcq">Multiple Choice Questions (MCQ)</option>
                    <option value="descriptive">Descriptive Questions</option>
                  </select>
                </div>

                {/* AI Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Brain className="inline w-4 h-4 mr-2" />
                    AI Instructions (Detailed Prompt)
                  </label>
                  <textarea
                    name="aiPrompt"
                    value={form.aiPrompt}
                    onChange={handleChange}
                    placeholder="Example: Generate questions on Data Structures, focusing on trees and graphs. Include questions on traversal algorithms, complexity analysis, and real-world applications. Make questions challenging for 3rd year CS students."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">Be specific about topics, difficulty level, and focus areas</p>
                </div>

                {/* Student Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline w-4 h-4 mr-2" />
                    Student Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Instructions for students about this quiz..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Duration, Total Questions, Passing Score */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline w-4 h-4 mr-2" />
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={form.durationMinutes}
                      onChange={handleChange}
                      min="10"
                      max="180"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="inline w-4 h-4 mr-2" />
                      Total Questions
                    </label>
                    <input
                      type="number"
                      name="totalQuestions"
                      value={form.totalQuestions}
                      onChange={handleChange}
                      min="5"
                      max="50"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CheckCircle className="inline w-4 h-4 mr-2" />
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      name="passingScore"
                      value={form.passingScore}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-2" />
                    Deadline (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !form.course || !form.aiPrompt}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                    isGenerating || !form.course || !form.aiPrompt
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      AI is generating and publishing quiz...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles size={20} />
                      Generate & Publish Quiz to Students
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
                      <option value="">{loadingCourses ? "Loading courses..." : "Select a course"}</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code ? `${course.code} - ` : ""}{course.name}
                        </option>
                      ))}
                    </select>
                    {(!loadingCourses && courses.length === 0) && (
                      <p className="text-sm text-gray-500 mt-2">No courses assigned to you yet.</p>
                    )}
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
                    title="Quiz Published"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <span className="text-white text-sm bg-white/20 px-3 py-2 rounded-lg">
                    Published to Students
                  </span>
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
