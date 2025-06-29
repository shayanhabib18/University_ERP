import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";

export default function QuizModal({ onClose }) {
  const [studentAnswers, setStudentAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  const handleAnswerChange = (qIndex, answer) => {
    setStudentAnswers((prev) => ({ ...prev, [qIndex]: answer }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 4) + 7; // random 7–10
      const feedback = "Good work! Improve explanation with more depth next time.";
      setGradingResult({ score, feedback });
      setSubmitting(false);
    }, 2000);
  };

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleBlur = () => {
      alert("You switched tabs or minimized the window. Quiz ended.");
      onClose();
    };

    const enterFullScreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
    };
    enterFullScreen();

    window.addEventListener("blur", handleBlur);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.exitFullscreen?.();
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-white p-6 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-indigo-700">📘 Quiz In Progress</h2>
        <button onClick={onClose} className="text-red-600 hover:text-red-800">
          <XCircle size={28} />
        </button>
      </div>

      {gradingResult ? (
        <div className="mt-10 text-center">
          <h3 className="text-2xl font-semibold text-green-700 mb-2">✅ Quiz Graded</h3>
          <p className="text-lg text-gray-700">Score: <strong>{gradingResult.score}/10</strong></p>
          <p className="mt-2 text-sm text-gray-600 italic">{gradingResult.feedback}</p>
          <button
            onClick={onClose}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      ) : (
        <div>
          {/* Question 1 */}
          <div className="mb-6">
            <p className="text-gray-800 font-medium mb-2">1. What is the purpose of TCP?</p>
            <div className="space-y-2 text-sm text-gray-700">
              {["Reliable communication", "Address resolution", "Error correction only", "Domain naming"].map((option, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="q1"
                    value={option}
                    checked={studentAnswers[0] === option}
                    onChange={() => handleAnswerChange(0, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Add more questions here similarly */}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {submitting ? "Grading..." : "Submit Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";

export default function QuizModal({ onClose, quiz }) {
  const [studentAnswers, setStudentAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  const handleAnswerChange = (qIndex, answer) => {
    setStudentAnswers((prev) => ({ ...prev, [qIndex]: answer }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 4) + 7; // 7–10
      const feedback = "Good work! Improve explanation with more depth next time.";
      setGradingResult({ score, feedback });
      setSubmitting(false);
    }, 2000);
  };

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleBlur = () => {
      alert("You switched tabs or minimized the window. Quiz ended.");
      onClose();
    };

    const enterFullScreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
    };
    enterFullScreen();

    window.addEventListener("blur", handleBlur);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.exitFullscreen?.();
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-white p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-700 mb-1">📝 Quiz In Progress</h2>
          <p className="text-gray-600 text-sm">{quiz?.course}</p>
        </div>
        <button onClick={onClose} className="text-red-600 hover:text-red-800">
          <XCircle size={28} />
        </button>
      </div>

      {/* Result Section */}
      {gradingResult ? (
        <div className="text-center mt-20">
          <h3 className="text-2xl font-bold text-green-600">✅ Quiz Completed</h3>
          <p className="text-gray-800 text-lg mt-4 font-semibold">
            Score: <span className="text-blue-600">{gradingResult.score} / 10</span>
          </p>
          <p className="mt-2 text-gray-600 italic">{gradingResult.feedback}</p>
          <button
            onClick={onClose}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          {/* Questions */}
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Question 1 */}
            <div>
              <p className="text-gray-800 font-medium mb-2">
                1. What is the purpose of TCP?
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                {[
                  "Reliable communication",
                  "Address resolution",
                  "Error correction only",
                  "Domain naming",
                ].map((option, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="q1"
                      value={option}
                      checked={studentAnswers[0] === option}
                      onChange={() => handleAnswerChange(0, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Add more questions here if needed */}
          </div>

          {/* Submit Button */}
          <div className="mt-10 text-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
            >
              {submitting ? "Grading..." : "Submit Quiz"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
