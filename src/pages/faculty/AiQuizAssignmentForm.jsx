import { useState } from "react";
import { FileText, Sparkles, Share2, UploadCloud, Upload } from "lucide-react";

const AiQuizAssignmentForm = () => {
  const [form, setForm] = useState({
    course: "",
    type: "mcq",
    topic: "",
    hint: "",
    file: null,
  });

  const [assignment, setAssignment] = useState({
    course: "",
    deadline: "",
    file: null,
  });

  const [generatedQuestions, setGeneratedQuestions] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((prev) => ({ ...prev, file: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAssignmentChange = (e) => {
    const { name, value, files } = e.target;
    setAssignment((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleGenerate = () => {
    const mockData =
      form.type === "mcq"
        ? [
            {
              question: "What is a binary search?",
              options: [
                "Linear search",
                "Search by hashing",
                "Divide and conquer",
                "Loop-based",
              ],
            },
            {
              question: "Time complexity of binary search?",
              options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
            },
          ]
        : [
            {
              question:
                "Explain the working of binary search algorithm with an example.",
            },
            {
              question:
                "Discuss the advantages and limitations of using binary search.",
            },
          ];
    setGeneratedQuestions(mockData);
  };

  const handleShare = () => {
    alert("Question paper shared with students ✅");
    // Implement backend call here
  };

  const handleAssignmentSubmit = () => {
    if (!assignment.course || !assignment.deadline || !assignment.file) {
      return alert("Please fill all assignment fields!");
    }
    alert(`Assignment uploaded for ${assignment.course} due on ${assignment.deadline}`);
    // Implement backend upload logic here
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10 space-y-12">

      {/* 📘 Section 1: AI Quiz Generator */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-700">
          <Sparkles /> AI-Based Quiz Generator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Select Course</option>
            <option value="CS101">CS101</option>
            <option value="CS102">CS102</option>
          </select>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="mcq">MCQ</option>
            <option value="descriptive">Descriptive</option>
          </select>
        </div>

        <input
          type="text"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          placeholder="Enter Topic (e.g., Binary Search)"
          className="w-full p-2 border rounded mb-4"
        />

        <textarea
          name="hint"
          value={form.hint}
          onChange={handleChange}
          placeholder="Enter hint/instruction for AI (optional)"
          className="w-full p-2 border rounded mb-4"
          rows={2}
        />

        {/* Quiz Lecture File Upload */}
        <div className="mb-6">
          <label
            htmlFor="fileUpload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm text-gray-700 transition"
          >
            <UploadCloud size={18} />
            Choose PDF Lecture Slide
          </label>
          <input
            type="file"
            accept=".pdf"
            name="file"
            id="fileUpload"
            onChange={handleChange}
            className="hidden"
          />
          {form.file && (
            <p className="mt-2 text-sm text-gray-600">📄 {form.file.name}</p>
          )}
        </div>

        <button
          onClick={handleGenerate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition"
        >
          🚀 Generate Quiz
        </button>

        {generatedQuestions && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="text-green-600" /> Generated{" "}
              {form.type === "mcq" ? "MCQs" : "Questions"}
            </h3>

            <div className="space-y-4">
              {form.type === "mcq" ? (
                generatedQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 p-4 rounded border shadow-sm"
                  >
                    <p className="font-medium">
                      {i + 1}. {q.question}
                    </p>
                    <ul className="list-disc ml-6 mt-2 text-sm">
                      {q.options.map((opt, idx) => (
                        <li key={idx}>{opt}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                generatedQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 p-4 rounded border shadow-sm"
                  >
                    <p className="font-medium">
                      {i + 1}. {q.question}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={handleShare}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded flex items-center gap-2"
              >
                <Share2 size={16} /> Share with Students
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📄 Section 2: Assignment Upload */}
      <div className="pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-700">
          <Upload /> Upload Assignment (PDF)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            name="course"
            value={assignment.course}
            onChange={handleAssignmentChange}
            className="p-2 border rounded"
          >
            <option value="">Select Course</option>
            <option value="CS101">CS101</option>
            <option value="CS102">CS102</option>
          </select>

          <input
            type="date"
            name="deadline"
            value={assignment.deadline}
            onChange={handleAssignmentChange}
            className="p-2 border rounded"
          />
        </div>

        {/* Custom File Upload for Assignment */}
        <div className="mb-4">
          <label
            htmlFor="assignmentFile"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm text-gray-700 transition"
          >
            <UploadCloud size={18} />
            Choose Assignment PDF
          </label>
          <input
            type="file"
            accept=".pdf"
            name="file"
            id="assignmentFile"
            onChange={handleAssignmentChange}
            className="hidden"
          />
          {assignment.file && (
            <p className="mt-2 text-sm text-gray-600">📎 {assignment.file.name}</p>
          )}
        </div>

        <button
          onClick={handleAssignmentSubmit}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
        >
          📤 Upload Assignment
        </button>
      </div>
    </div>
  );
};

export default AiQuizAssignmentForm;
