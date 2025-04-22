import { useState } from "react";
import { Link } from "react-router-dom";

export default function StudentLogin() {
  const [loginType, setLoginType] = useState("rollCnic"); // "rollCnic" or "email"
  const [rollCnic, setRollCnic] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    if (loginType === "rollCnic") {
      console.log("Logging in with RollNo-CNIC:", rollCnic, password);
    } else {
      console.log("Logging in with Email:", email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md transition-all transform hover:scale-105 hover:shadow-xl duration-500">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6 animate__animated animate__fadeIn animate__delay-1s">
          Student Login
        </h2>

        {/* Login method switch */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              loginType === "rollCnic"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setLoginType("rollCnic")}
          >
            RollNo/CNIC
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              loginType === "email"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setLoginType("email")}
          >
            Email
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {loginType === "rollCnic" ? (
            <div className="mb-4">
              <label htmlFor="rollCnic" className="block text-gray-700 text-sm font-medium">
                RollNo/CNIC
              </label>
              <input
                type="text"
                id="rollCnic"
                value={rollCnic}
                onChange={(e) => setRollCnic(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="e.g. 20SE012-3520212345678"
                required
              />
            </div>
          ) : (
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            <Link
              to="#"
              className="text-blue-600 hover:text-blue-700"
            >
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
