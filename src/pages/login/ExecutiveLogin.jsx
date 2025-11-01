import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ExecutiveLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Hardcoded credentials
    const hardcodedEmail = "executive@university.edu";
    const hardcodedPassword = "admin123";

    if (email === hardcodedEmail && password === hardcodedPassword) {
      // Successful login → redirect to dashboard
      navigate("/executive/dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md transition-all transform hover:scale-105 hover:shadow-xl duration-500">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6 animate__animated animate__fadeIn animate__delay-1s">
          Executive Portal Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-medium"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              placeholder="executive@university.edu"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-medium"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              placeholder="Password: admin123"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            <Link to="#" className="text-blue-600 hover:text-blue-700">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
