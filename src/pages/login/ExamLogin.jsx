import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ExamLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Hardcoded Exam Department credentials
    const hardcodedExamUser = {
      email: "exam@university.edu",
      password: "exam123",
    };

    if (email === hardcodedExamUser.email && password === hardcodedExamUser.password) {
      setError("");
      navigate("/exam/dashboard"); // Redirect to Exam Department dashboard
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-blue-100">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Exam Department Login
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-400"
              placeholder="e.g. exam@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-400"
              placeholder="e.g. exam123"
              required
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Login
          </button>

          {/* Forgot Password */}
          <div className="text-center mt-2">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline focus:outline-none"
              onClick={() => alert("Please contact admin to reset your password.")}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
