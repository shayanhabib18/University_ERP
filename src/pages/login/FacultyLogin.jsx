// src/pages/login/FacultyLogin.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FacultyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call backend to authenticate faculty
      const response = await axios.post('http://localhost:5000/faculties/login', {
        email: email,
        password: password,
      });

      if (response.data?.success || response.data?.user) {
        console.log("✅ Faculty logged in:", response.data.user?.email || email);
        
        // Store auth token and basic identity info if provided
        if (response.data?.token) {
          localStorage.setItem('facultyToken', response.data.token);
        }
        if (response.data?.user?.email || email) {
          localStorage.setItem('facultyEmail', response.data.user?.email || email);
        }
        if (response.data?.user?.name) {
          localStorage.setItem('facultyName', response.data.user.name);
        }
        
        navigate("/faculty/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Invalid email or password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Faculty Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
              placeholder="Enter your Email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500"
              placeholder="Enter Your Password"
              required
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center mt-2">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline focus:outline-none"
              onClick={() => navigate("/login/faculty/forgot-password")}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
