
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CoordinatorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // hardcoded credentials
    const hardcodedCoordinator = {
      email: "coordinator@university.edu",
      password: "coordinator123",
    };

    if (
      email === hardcodedCoordinator.email &&
      password === hardcodedCoordinator.password
    ) {
      setError("");
      navigate("/coordinator/dashboard"); // Redirect to coordinator dashboard
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-orange-500"
              placeholder="e.g. coordinator@university.edu"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-orange-500"
              placeholder="e.g. coordinator123"
              required
            />
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Login
          </button>

          {/* Forgot password */}
          <div className="text-center mt-2">
            <button
              type="button"
              className="text-sm text-orange-600 hover:underline focus:outline-none"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
