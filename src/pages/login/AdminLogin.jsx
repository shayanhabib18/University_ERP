// src/pages/login/AdminLogin.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('admin login')

    // Send to your Node.js server
    // const response = await fetch("http://localhost:4000/login/admin", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, password }),
    // });
    // const data = await response.json();
    // console.log(data);

    // // Hardcoded admin credentials
    const ADMIN_CREDENTIALS = {
      email: "admin@university.edu",
      password: "admin123",
    };

    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      navigate("/admin/dashboard"); // Redirect to dashboard
    } else {
      alert(
        `Invalid credentials. Use:\nEmail: ${ADMIN_CREDENTIALS.email}\nPassword: ${ADMIN_CREDENTIALS.password}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md transition-all transform hover:scale-105 hover:shadow-xl duration-500">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6 animate__animated animate__fadeIn animate__delay-1s">
          Admin Login
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
              placeholder="admin@university.edu"
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
              placeholder="admin123"
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
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline focus:outline-none"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
