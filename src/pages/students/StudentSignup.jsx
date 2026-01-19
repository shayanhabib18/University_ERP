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
    dateOfBirth: "",
    gender: "",
    cnic: "",
    email: "",
    mobile: "",
    parentPhone: "",
    address: "",
    city: "",
    departmentId: "",
    joiningSession: "",
    joiningDate: "",
    qualification: "",
    totalMarks: "",
    obtainedMarks: "",
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
      dateOfBirth,
      gender,
      cnic,
      email,
      mobile,
      parentPhone,
      address,
      city,
      departmentId,
      joiningSession,
      joiningDate,
      qualification,
      totalMarks,
      obtainedMarks,
      marksheetFile,
    } = formData;

    if (
      !studentName ||
      !fatherName ||
      !dateOfBirth ||
      !gender ||
      !cnic ||
      !email ||
      !mobile ||
      !parentPhone ||
      !address ||
      !city ||
      !departmentId ||
      !joiningSession ||
      !joiningDate ||
      !qualification ||
      !totalMarks ||
      !obtainedMarks ||
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
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        cnic: formData.cnic,
        email: formData.email,
        mobile: formData.mobile,
        parent_phone: formData.parentPhone,
        address: formData.address,
        city: formData.city,
        department_id: formData.departmentId,
        joining_session: formData.joiningSession,
        joining_date: formData.joiningDate,
        qualification: formData.qualification,
        total_marks: Number(formData.totalMarks),
        obtained_marks: Number(formData.obtainedMarks),
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
          {/* Personal Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="studentName"
                    placeholder="Enter full name"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="fatherName"
                    placeholder="Enter father name"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* CNIC Number */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Number</label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="cnic"
                    placeholder="Enter 13-digit CNIC number"
                    value={formData.cnic}
                    onChange={handleChange}
                    required
                    maxLength="13"
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Department Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category/Department</label>
                <div className="relative">
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                    disabled={deptLoading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                  >
                    <option value="">{deptLoading ? "Loading departments..." : "Select Category/Department"}</option>
                    {departments.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Joining Session */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Session</label>
                <div className="relative">
                  <select
                    name="joiningSession"
                    value={formData.joiningSession}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select Joining Session</option>
                    <option value="Spring">Spring</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Student Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Student Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Enter phone number"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Parent Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="parentPhone"
                    placeholder="Enter parent phone number"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="city"
                    placeholder="Enter city name"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Last Qualification */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Last Qualification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Last Qualification Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Qualification</label>
                <div className="relative">
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select Last Qualification</option>
                    <option value="FSc">FSc (Pre-Engineering/Pre-Medical)</option>
                    <option value="A-Levels">A-Levels</option>
                    <option value="ICS">ICS (Intermediate Computer Science)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Total Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                <div className="relative">
                  <input
                    type="number"
                    name="totalMarks"
                    placeholder="Enter total marks"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Obtained Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obtained Marks</label>
                <div className="relative">
                  <input
                    type="number"
                    name="obtainedMarks"
                    placeholder="Enter obtained marks"
                    value={formData.obtainedMarks}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Eligibility Check */}
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

            {/* Upload Academic Documents */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Academic Documents</label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition duration-200">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium text-center">Upload Academic Documents</p>
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
