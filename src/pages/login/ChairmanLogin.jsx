  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";

  export default function ChairmanLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        // 1) First try manual HOD login (for manually assigned HODs)
        let user = null;
        let token = null;
        let isManualHOD = false;

        try {
          const hodLoginRes = await axios.post("http://localhost:5000/departments/hod-login", {
            email,
            password,
          });
          
          user = hodLoginRes.data?.user;
          token = hodLoginRes.data?.token;
          isManualHOD = true;
        } catch (hodError) {
          console.log("HOD login attempt failed, trying faculty login...", hodError.message);
          // If HOD login fails, try faculty login for faculty-linked HODs
          try {
            const loginRes = await axios.post("http://localhost:5000/faculties/login", {
              email,
              password,
            });

            user = loginRes.data?.user;
            token = loginRes.data?.token;
          } catch (facultyError) {
            // Both failed - throw the faculty error as it's the final attempt
            throw facultyError;
          }
        }

        if (!user || !token) throw new Error("Login failed");

        // Persist token for subsequent API calls
        localStorage.setItem("facultyToken", token);
        localStorage.setItem("facultyEmail", user.email);
        localStorage.setItem("facultyName", user.name || "");

        // If it was a manual HOD login, we're already verified
        if (isManualHOD) {
          navigate("/chair/dashboard");
          return;
        }

        // 2) For faculty login, verify this faculty is the current HOD for their department
        const hodRes = await axios.get(`http://localhost:5000/departments/${user.department_id}/hod`);
        const hod = hodRes.data; // { name, email } or null

        if (!hod || !hod.email) {
          throw new Error("You are not currently assigned as HOD.");
        }

        // Match by email (case-insensitive)
        const isHOD = String(hod.email).toLowerCase() === String(user.email).toLowerCase();
        if (!isHOD) {
          throw new Error("You are not currently assigned as HOD.");
        }

        // Success → redirect to HOD dashboard
        navigate("/chair/dashboard");
      } catch (err) {
        const msg = err.response?.data?.error || err.message || "Invalid email or password";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md transition-all transform hover:scale-105 hover:shadow-xl duration-500">
          <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6 animate__animated animate__fadeIn animate__delay-1s">
            Department Chair Login
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                placeholder="Enter your HOD email"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline focus:outline-none"
              onClick={() => navigate("/login/chairman/forgot-password")}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    );
  }
