import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function StudentLogin() {
  const [identifier, setIdentifier] = useState(""); // Roll number or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // ✅ Hardcoded student credentials (can login using either roll number or email)
    const hardcodedStudent = {
      rollNo: "BSSE1234",
      email: "student@university.edu",
      password: "student123",
    };

    const isValidUser =
      (identifier === hardcodedStudent.rollNo || identifier === hardcodedStudent.email) &&
      password === hardcodedStudent.password;

    if (isValidUser) {
      setError("");
      navigate("/student/dashboard"); // Redirect to student dashboard
    } else {
      setError("Invalid roll number/email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Student Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Roll Number or Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
              placeholder="e.g. BSSE1234 or student@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
              placeholder="e.g. student123"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Login
          </button>

          <div className="text-center mt-2">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline focus:outline-none"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          {/* ✅ Signup Link added BELOW forgot password */}
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/signup/student" className="text-blue-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
