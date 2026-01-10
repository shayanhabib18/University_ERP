import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// Using backend /auth/login; no direct Supabase client in frontend

export default function StudentLogin() {
  const [identifier, setIdentifier] = useState(""); // Roll number or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let email = identifier;
      let accessToken = "";
      let studentProfile = null;

      // Resolve roll number to email
      if (!identifier.includes("@")) {
        const resp1 = await fetch(`http://localhost:5000/students/search?q=${encodeURIComponent(identifier)}`);
        const data = await resp1.json();
        const exact = (data || []).find((s) => s.roll_number?.toLowerCase() === identifier.toLowerCase());
        if (!exact) {
          throw new Error("Student not found for provided roll number");
        }
        email = exact.personal_email;
      }

      const resp2 = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await resp2.json();
      if (!resp2.ok) {
        throw new Error(json.error || "Login failed");
      }

      accessToken = json.access_token || "";
      localStorage.setItem("student_token", accessToken);

      // Fetch current student profile to get name/roll/email
      try {
        const meResp = await fetch("http://localhost:5000/students/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meResp.ok) {
          studentProfile = await meResp.json();
          localStorage.setItem("student_info", JSON.stringify(studentProfile));
        } else {
          localStorage.removeItem("student_info");
        }
      } catch (profileErr) {
        console.warn("Failed to load student profile", profileErr);
        localStorage.removeItem("student_info");
      }

      navigate("/student/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
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
              placeholder="Enter your roll number or email"
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
              placeholder="Enter your password"
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
