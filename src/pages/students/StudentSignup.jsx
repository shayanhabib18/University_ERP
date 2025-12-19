import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  IdCard, 
  Lock, 
  GraduationCap, 
  Award, 
  MapPin,
  Eye,
  EyeOff,
  Shield,
  BookOpen,
  FileText,
  Upload
} from "lucide-react";

export default function StudentSignup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    studentName: "",
    fatherName: "",
    email: "",
    mobile: "",
    cnic: "",
    password: "",
    confirmPassword: "",
    qualification: "",
    obtainedMarks: "",
    totalMarks: "",
    city: "",
    degree: "",
    marksheetFile: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Remove error when user starts typing
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError("Only PDF, JPEG, and PNG files are allowed");
        return;
      }
      
      setFormData({ ...formData, marksheetFile: file });
      setFileName(file.name);
      if (error) setError("");
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.mobile && !/^\d{11}$/.test(formData.mobile)) {
      setError("Mobile number must be 11 digits");
      return false;
    }

    if (formData.cnic && !/^\d{13}$/.test(formData.cnic)) {
      setError("CNIC must be 13 digits");
      return false;
    }

    if (!formData.marksheetFile) {
      setError("Please upload your last qualification marksheet");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setError("");
    
    // Simulate API call
    setTimeout(() => {
      setSuccess("Application submitted successfully! Please wait for approval.");
      setLoading(false);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login/student");
      }, 2000);
    }, 1500);
  };

  const inputClasses = (fieldName) => `
    w-full px-4 py-3 pl-11 rounded-xl border 
    ${touched[fieldName] && !formData[fieldName] ? 'border-red-300' : 'border-gray-300'}
    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
    transition-all duration-200 bg-white
    placeholder:text-gray-400
  `;

  const iconClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-5 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Student Registration
          </h1>
          <p className="text-gray-600 text-lg">
            Complete the form below to start your academic journey
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  <p className="text-sm text-gray-500">Enter your basic details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { icon: User, name: "studentName", placeholder: "Student Name", type: "text" },
                  { icon: User, name: "fatherName", placeholder: "Father Name", type: "text" },
                  { icon: Mail, name: "email", placeholder: "Email Address", type: "email" },
                  { icon: Phone, name: "mobile", placeholder: "Mobile Number", type: "tel" },
                  { icon: IdCard, name: "cnic", placeholder: "CNIC (13 digits)", type: "text" },
                  { icon: MapPin, name: "city", placeholder: "City", type: "text" },
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <field.icon className={iconClasses} size={20} />
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={inputClasses(field.name)}
                      maxLength={field.name === "mobile" ? "11" : field.name === "cnic" ? "13" : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Academic Information</h3>
                  <p className="text-sm text-gray-500">Provide your educational background</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Last Qualification */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Last Qualification
                  </label>
                  <div className="relative">
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`${inputClasses('qualification')} appearance-none cursor-pointer`}
                    >
                      <option value="" disabled>Select Qualification</option>
                      <option value="Matric">Matric</option>
                      <option value="FSC">FSC</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Marks Fields */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Obtained Marks
                  </label>
                  <div className="relative">
                    <Award className={iconClasses} size={20} />
                    <input
                      type="number"
                      name="obtainedMarks"
                      placeholder="Enter obtained marks"
                      value={formData.obtainedMarks}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      min="0"
                      className={inputClasses('obtainedMarks')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Marks
                  </label>
                  <div className="relative">
                    <Award className={iconClasses} size={20} />
                    <input
                      type="number"
                      name="totalMarks"
                      placeholder="Enter total marks"
                      value={formData.totalMarks}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      min="0"
                      className={inputClasses('totalMarks')}
                    />
                  </div>
                </div>
              </div>

              {/* Last Qualification Marksheet Upload */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Last Qualification Marksheet</h4>
                    <p className="text-sm text-gray-500">Upload your marksheet for verification (PDF, JPEG, PNG, max 5MB)</p>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    id="marksheetFile"
                    name="marksheetFile"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label
                    htmlFor="marksheetFile"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        {fileName ? fileName : "Click to upload marksheet"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPEG, or PNG (Max 5MB)
                      </p>
                    </div>
                  </label>
                  
                  {fileName && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, marksheetFile: null });
                          setFileName("");
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Degree Program Section */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Select Your Degree Program</h3>
                    <p className="text-sm text-gray-500">Choose the degree program you want to take admission in</p>
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 
                             focus:border-purple-500 focus:ring-2 focus:ring-purple-200 
                             transition-all duration-200 bg-white appearance-none
                             text-gray-700 cursor-pointer"
                  >
                    <option value="" disabled>Select Degree Program</option>
                    <option value="AI">Bachelor of Science in Artificial Intelligence</option>
                    <option value="CYS">Bachelor of Science in Cyber Security</option>
                    <option value="SE">Bachelor of Science in Software Engineering</option>
                    <option value="CS">Bachelor of Science in Computer Science</option>
                    <option value="IT">Bachelor of Science in Information Technology</option>
                    <option value="DS">Bachelor of Science in Data Science</option>
                    <option value="BBA">Bachelor of Business Administration</option>
                    <option value="MBA">Master of Business Administration</option>
                  </select>
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Account Security</h3>
                  <p className="text-sm text-gray-500">Create a secure password</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={iconClasses} size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={inputClasses('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className={iconClasses} size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={inputClasses('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Password must be at least 8 characters long</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 
                       hover:from-blue-700 hover:to-indigo-700 text-white font-semibold 
                       text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
                       active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin mr-3"></div>
                  Processing Application...
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          </form>

          {/* Error and Success Messages */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
              <p className="text-red-600 text-center font-medium flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
              <p className="text-green-600 text-center font-medium flex items-center justify-center mb-3">
                <Award className="w-5 h-5 mr-2" />
                {success}
              </p>
              <div className="w-full bg-green-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full animate-[progress_2s_linear]"></div>
              </div>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/login/student" 
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors inline-flex items-center"
              >
                Login here
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}