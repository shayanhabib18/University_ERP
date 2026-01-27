import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CoordinatorLogin() {
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
      // Call backend coordinator login endpoint
      const response = await axios.post('http://localhost:5000/faculties/coordinator/login', {
        email: email,
        password: password,
      });

      if (response.data?.success || response.data?.user) {
        // Backend already validates coordinator role, so we just proceed
        console.log("✅ Coordinator logged in:", response.data.user?.email || email);
        
        // Store auth token and basic identity info if provided
        if (response.data?.token) {
          // Store under coordinator-specific key, keep old key for backward compatibility
          localStorage.setItem('coordinator_token', response.data.token);
          localStorage.setItem('facultyToken', response.data.token);
        }
        const userObj = response.data?.user || {};
        const emailToStore = userObj.email || email;
        const nameToStore = userObj.name || userObj.full_name || "Coordinator";
        const deptIdToStore = userObj.department_id || userObj.departmentId || "";
        const deptNameToStore = userObj.department_name || userObj.departmentName || "";

        if (emailToStore) {
          localStorage.setItem('facultyEmail', emailToStore);
        }
        if (nameToStore) {
          localStorage.setItem('facultyName', nameToStore);
        }
        if (deptIdToStore) {
          localStorage.setItem('departmentId', deptIdToStore);
        }

        // Store consolidated coordinator info for dashboard usage
        localStorage.setItem('coordinator_info', JSON.stringify({
          email: emailToStore,
          name: nameToStore,
          full_name: nameToStore,
          department_id: deptIdToStore,
          department_name: deptNameToStore,
          role: 'COORDINATOR'
        }));
        
        navigate("/coordinator/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">
          Coordinator Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-purple-500"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-purple-500"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot password */}
          <div className="text-center mt-2">
            <button
              type="button"
              className="text-sm text-purple-600 hover:text-purple-800 hover:underline focus:outline-none transition-colors duration-200"
              onClick={() => navigate("/login/coordinator/forgot-password")}
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