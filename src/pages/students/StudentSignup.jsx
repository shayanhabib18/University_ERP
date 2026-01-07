import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  IdCard,
  MapPin,
  BookOpen,
  FileText,
  Upload,
  Shield,
  X,
} from "lucide-react";

export default function StudentSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentName: "",
    fatherName: "",
    email: "",
    mobile: "",
    cnic: "",
    qualification: "",
    obtainedMarks: "",
    totalMarks: "",
    city: "",
    departmentId: "",
    joiningDate: "",
    joiningSession: "",
    marksheetFile: null,
  });

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [deptLoading, setDeptLoading] = useState(true);

  // Fetch departments from backend API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDeptLoading(true);
        const response = await fetch("http://localhost:5000/departments");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched departments:", data);
        setDepartments(data || []);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setError("Failed to load departments. Make sure backend is running on localhost:5000");
      } finally {
        setDeptLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Calculate eligibility
  const calculatePercentage = () => {
    const obtained = Number(formData.obtainedMarks);
    const total = Number(formData.totalMarks);
    if (!obtained || !total || total === 0) return null;
    return (obtained / total) * 100;
  };

  const percentage = calculatePercentage();
  const isEligible = percentage !== null && percentage >= 55;

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPEG, and PNG files are allowed");
      return;
    }

    setFormData({ ...formData, marksheetFile: file });
    setFileName(file.name);
  };

  const removeFile = () => {
    setFormData({ ...formData, marksheetFile: null });
    setFileName("");
  };

  // Validate all fields
  const validateForm = () => {
    const {
      studentName,
      fatherName,
      email,
      mobile,
      cnic,
      city,
      qualification,
      departmentId,
      obtainedMarks,
      totalMarks,
      joiningDate,
      joiningSession,
      marksheetFile,
    } = formData;

    if (
      !studentName ||
      !fatherName ||
      !email ||
      !mobile ||
      !cnic ||
      !city ||
      !qualification ||
      !departmentId ||
      !obtainedMarks ||
      !totalMarks ||
      !joiningDate ||
      !joiningSession ||
      !marksheetFile
    ) {
      setError("All fields are required");
      return false;
    }

    if (percentage !== null && percentage < 55) {
      setError("You are not eligible for admission (minimum 55% required)");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Prepare form data for submission
      const signupData = {
        student_name: formData.studentName,
        father_name: formData.fatherName,
        email: formData.email,
        mobile: formData.mobile,
        cnic: formData.cnic,
        qualification: formData.qualification,
        obtained_marks: Number(formData.obtainedMarks),
        total_marks: Number(formData.totalMarks),
        city: formData.city,
        department_id: formData.departmentId,
        joining_date: formData.joiningDate,
        joining_session: formData.joiningSession,
        marksheet_url: formData.marksheetFile?.name || "", // Store file name for now
      };

      const response = await fetch("http://localhost:5000/students/signup-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      setSuccess(
        "Application submitted successfully! You will receive login credentials after admin approval."
      );
      setLoading(false);
      setTimeout(() => navigate("/login/student"), 2500);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to submit application. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Student Admission Form</h1>
          <p className="text-gray-600 mt-2">Submit your application for review</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { icon: User, name: "studentName", placeholder: "Student Name" },
                { icon: User, name: "fatherName", placeholder: "Father Name" },
                { icon: Mail, name: "email", placeholder: "Email Address" },
                { icon: Phone, name: "mobile", placeholder: "Mobile Number" },
                { icon: IdCard, name: "cnic", placeholder: "CNIC (13 digits)" },
                { icon: MapPin, name: "city", placeholder: "City" },
              ].map((f) => (
                <div key={f.name} className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name={f.name}
                    placeholder={f.placeholder}
                    value={formData[f.name]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Academic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <select
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              >
                <option value="">Select Last Qualification</option>
                <option value="FSc">FSc</option>
                <option value="O Levels">O Levels</option>
                <option value="Other">Other</option>
              </select>

              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
                disabled={deptLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 disabled:bg-gray-100"
              >
                <option value="">{deptLoading ? "Loading departments..." : "Select Department"}</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="number"
                name="obtainedMarks"
                placeholder="Obtained Marks"
                value={formData.obtainedMarks}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
              <input
                type="number"
                name="totalMarks"
                placeholder="Total Marks"
                value={formData.totalMarks}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {percentage !== null && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                  isEligible
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {isEligible
                  ? `✅ Eligible (${percentage.toFixed(2)}%)`
                  : `❌ Not Eligible (${percentage.toFixed(2)}%) — Minimum 55% required`}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <select
                name="joiningSession"
                value={formData.joiningSession}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              >
                <option value="">Select Joining Session</option>
                <option value="Spring">Spring</option>
                <option value="Fall">Fall</option>
              </select>

              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>
          </div>

          {/* Marksheet Upload */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Upload Last Qualification Marksheet</h3>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition duration-200">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium text-center">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-500 text-center">PDF, JPG, PNG (Max 5MB)</p>
              <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileChange} className="hidden" />
            </label>

            {fileName && (
              <div className="mt-3 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700 truncate">{fileName}</span>
                </div>
                <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700">
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (percentage !== null && percentage < 55)}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 p-3 rounded-lg text-red-600 text-center">
            <Shield className="inline w-4 h-4 mr-1" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 bg-green-50 border border-green-200 p-4 rounded-lg text-green-600 text-center">
            {success}
          </div>
        )}

        <p className="mt-6 text-center text-gray-600">
          Already approved?{" "}
          <Link to="/login/student" className="text-blue-600 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
