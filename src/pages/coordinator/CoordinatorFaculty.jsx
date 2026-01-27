import { useState, useEffect } from "react";
import { Users, ArrowRight, User, GraduationCap, BookOpen, ChevronRight, Filter, Building, X, Search, Download, Eye, ListChecks, Info, Phone, Award, Briefcase } from "lucide-react";
import axios from "axios";

const colorPalette = [
  "bg-gradient-to-r from-blue-500 to-cyan-500",
  "bg-gradient-to-r from-emerald-500 to-teal-500",
  "bg-gradient-to-r from-amber-500 to-orange-500",
  "bg-gradient-to-r from-indigo-500 to-blue-600",
  "bg-gradient-to-r from-rose-500 to-pink-500",
  "bg-gradient-to-r from-sky-500 to-blue-500",
];

export default function CoordinatorFaculty() {
  const [allDepartments, setAllDepartments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDeptData, setSelectedDeptData] = useState(null);
  const [coordinatorDeptName, setCoordinatorDeptName] = useState("");
  const [coordinatorDeptId, setCoordinatorDeptId] = useState("");

  const [activeTab, setActiveTab] = useState("faculty");
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [facultyDetailId, setFacultyDetailId] = useState(null);
  const [facultyDetail, setFacultyDetail] = useState(null);
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [facultyDetailLoading, setFacultyDetailLoading] = useState(false);
  const [facultyDetailError, setFacultyDetailError] = useState("");

  useEffect(() => {
    // Get coordinator department from stored profile
    try {
      const stored = localStorage.getItem("coordinator_info");
      if (stored) {
        const info = JSON.parse(stored);
        const deptName =
          info.department_name ||
          info.department?.name ||
          info.dept_name ||
          info.department ||
          "";
        setCoordinatorDeptName(deptName);
        setCoordinatorDeptId(info.department_id || info.departmentId || "");
      }
    } catch (err) {
      console.warn("Failed to parse coordinator info", err);
    }

    // Fallback: fetch coordinator profile if not in localStorage
    if (!coordinatorDeptName) {
      const token = localStorage.getItem("coordinator_token") || localStorage.getItem("facultyToken");
      if (token) {
        axios
          .get("http://localhost:5000/faculties/coordinator/profile", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            if (res.data?.department_name) {
              setCoordinatorDeptName(res.data.department_name);
              setCoordinatorDeptId(res.data.department_id || "");
              // cache for next render
              localStorage.setItem("coordinator_info", JSON.stringify(res.data));
            }
          })
          .catch((err) => console.warn("Coordinator profile fetch failed", err));
      }
    }
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/departments");
        const list = Array.isArray(res.data) ? res.data : [];
        const mapped = list.map((dept, idx) => ({
          id: dept.id,
          name: dept.name || dept.department_name || dept.title || "Department",
          short: (dept.code || dept.short_code || (dept.name ? dept.name.slice(0, 3) : "DEP")).toUpperCase(),
          color: colorPalette[idx % colorPalette.length],
          description: dept.description || "Manage records for this department",
        }));
        setAllDepartments(mapped);
      } catch (err) {
        console.warn("Failed to load departments", err);
        setAllDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    // Restrict to coordinator's department when known; otherwise show all
    if (coordinatorDeptName) {
      const filtered = allDepartments.filter(
        (dept) => dept.name.toLowerCase() === coordinatorDeptName.toLowerCase()
      );
      setDepartments(filtered.length > 0 ? filtered : allDepartments);
    } else {
      setDepartments(allDepartments);
    }
  }, [coordinatorDeptName, allDepartments]);

  const fetchFacultyDetail = async (faculty) => {
    try {
      setFacultyDetailLoading(true);
      setFacultyDetailError("");
      setFacultyDetailId(faculty.id === facultyDetailId ? null : faculty.id);
      
      // If clicking the same faculty, close the details
      if (faculty.id === facultyDetailId) {
        setFacultyDetail(null);
        setFacultyCourses([]);
        return;
      }

      // Fetch personal profile by email
      const profilePromise = faculty.email
        ? axios.get(`http://localhost:5000/faculties/profile/${encodeURIComponent(faculty.email)}`)
        : Promise.resolve({ data: faculty });

      // Fetch assigned courses for this faculty
      const coursesPromise = faculty.id
        ? axios.get(`http://localhost:5000/faculty-courses/faculty/${faculty.id}`)
        : Promise.resolve({ data: [] });

      const [profileRes, coursesRes] = await Promise.all([profilePromise, coursesPromise]);

      setFacultyDetail(profileRes.data || faculty);
      const rawCourses = Array.isArray(coursesRes.data?.courses) ? coursesRes.data.courses : coursesRes.data;
      const flatCourses = (rawCourses || []).map((item) => {
        const course = item.course || item;
        return {
          id: course.id || item.course_id || item.id,
          code: course.code || course.course_code,
          name: course.name || course.course_name,
          credit_hours: course.credit_hours || course.credits,
          student_count: item.student_count,
        };
      });
      setFacultyCourses(flatCourses);
    } catch (err) {
      console.error("Failed to load faculty detail", err);
      setFacultyDetailError(err.response?.data?.error || err.message || "Failed to load faculty detail");
    } finally {
      setFacultyDetailLoading(false);
    }
  };

  const closeFacultyDetails = () => {
    setFacultyDetailId(null);
    setFacultyDetail(null);
    setFacultyCourses([]);
  };

  const handleAccessDepartment = async (dept) => {
    setSelectedDept(dept.id);
    setSelectedDeptData(dept);
    setActiveTab("faculty");
    
    // Reset faculty details when switching departments
    setFacultyDetailId(null);
    setFacultyDetail(null);
    setFacultyCourses([]);
    
    // Fetch department data
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("coordinator_token") || localStorage.getItem("facultyToken");
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const [facultyRes, studentRes, coursesRes] = await Promise.all([
        axios.get("http://localhost:5000/faculties/coordinator/department-faculty", { headers: authHeaders }),
        axios.get("http://localhost:5000/faculties/coordinator/department-students", { headers: authHeaders }),
        axios.get("http://localhost:5000/courses"),
      ]);

      const facultyData = Array.isArray(facultyRes.data?.faculty) ? facultyRes.data.faculty : facultyRes.data;
      const studentData = Array.isArray(studentRes.data?.students) ? studentRes.data.students : studentRes.data;

      setFacultyList(Array.isArray(facultyData) ? facultyData : []);
      setStudentList(Array.isArray(studentData) ? studentData : []);

      const deptId = coordinatorDeptId;
      const allCourses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      const hasDeptField = allCourses.some((c) => c.department_id != null);
      const filteredCourses = deptId && hasDeptField
        ? allCourses.filter((c) => String(c.department_id) === String(deptId))
        : allCourses;
      setCourseList(filteredCourses);
    } catch (err) {
      console.error("Failed to load department data", err);
      setError(err.response?.data?.error || err.message || "Failed to load department data");
    } finally {
      setLoading(false);
    }
  };

  const closeDepartmentView = () => {
    setSelectedDept(null);
    setSelectedDeptData(null);
    setFacultyDetailId(null);
    setFacultyDetail(null);
    setFacultyCourses([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Department Management</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Access and manage faculty, students, and courses across departments
          </p>
        </div>

        {/* Coordinator Department Badge */}
        {coordinatorDeptName && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-xs">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Linked Department</p>
                <p className="font-semibold text-gray-900">{coordinatorDeptName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-200"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div 
                    className={`${dept.color} h-14 w-14 rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-lg">{dept.short}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{dept.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{dept.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleAccessDepartment(dept)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  Access Department
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Department Details Modal/Overlay */}
        {selectedDept && selectedDeptData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`${selectedDeptData.color} h-16 w-16 rounded-xl flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-xl">{selectedDeptData.short}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedDeptData.name}</h2>
                      <p className="text-gray-300 mt-1">Department Management Dashboard</p>
                    </div>
                  </div>
                  <button
                    onClick={closeDepartmentView}
                    className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex px-6">
                  <button
                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-all ${
                      activeTab === "faculty"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setActiveTab("faculty")}
                  >
                    <User className="h-5 w-5" />
                    Faculty
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {facultyList.length}
                    </span>
                  </button>
                  <button
                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-all ${
                      activeTab === "students"
                        ? "border-emerald-600 text-emerald-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setActiveTab("students")}
                  >
                    <GraduationCap className="h-5 w-5" />
                    Students
                    <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                      {studentList.length}
                    </span>
                  </button>
                  <button
                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-all ${
                      activeTab === "courses"
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setActiveTab("courses")}
                  >
                    <BookOpen className="h-5 w-5" />
                    Courses
                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {courseList.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 overflow-y-auto max-h-[55vh]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-4 text-gray-600">Loading department data...</span>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                ) : (
                  <>
                    {/* Faculty Tab Content */}
                    {activeTab === "faculty" && (
                      <div className="space-y-6">
                        <div className="mb-6">
                          <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search faculty members..."
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {facultyList.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Faculty Members</h3>
                              <p className="text-gray-500">No faculty members found in this department.</p>
                            </div>
                          ) : (
                            facultyList.map((f) => (
                              <div
                                key={f.id}
                                className={`bg-white rounded-xl border ${
                                  facultyDetailId === f.id 
                                    ? 'border-blue-300 shadow-md' 
                                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                } transition-all overflow-hidden`}
                              >
                                {/* Faculty Card Header */}
                                <div className="p-5">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow">
                                      <User className="h-6 w-6 text-white" />
                                    </div>
                                    <button
                                      className="text-gray-400 hover:text-blue-600 transition-colors"
                                      onClick={() => fetchFacultyDetail(f)}
                                      title={facultyDetailId === f.id ? "Hide Details" : "View Details"}
                                    >
                                      <Eye className={`h-5 w-5 ${facultyDetailId === f.id ? 'text-blue-600' : ''}`} />
                                    </button>
                                  </div>
                                  
                                  <h4 className="font-semibold text-gray-900 text-lg mb-1">{f.name}</h4>
                                  <p className="text-gray-600 text-sm mb-3">{f.designation || f.title || "Faculty Member"}</p>
                                  <p className="text-blue-600 text-sm truncate hover:text-blue-700 transition-colors">
                                    {f.email}
                                  </p>
                                </div>

                                {/* Faculty Details Section */}
                                {facultyDetailId === f.id && (
                                  <div className="border-t border-gray-100 bg-gradient-to-b from-blue-50/30 to-white">
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                          <Info className="h-5 w-5 text-blue-600" />
                                          Detailed Profile
                                        </h5>
                                        <button
                                          onClick={closeFacultyDetails}
                                          className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                                          title="Close Details"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>

                                      {facultyDetailLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                          <span className="ml-3 text-gray-600 text-sm">Loading details...</span>
                                        </div>
                                      ) : facultyDetailError ? (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                          <p className="text-red-700 text-sm">{facultyDetailError}</p>
                                        </div>
                                      ) : (
                                        <div className="space-y-4">
                                          {/* Contact Info */}
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-gray-700">
                                              <Phone className="h-4 w-4 text-blue-600" />
                                              <span className="text-sm">{facultyDetail?.phone || "Not provided"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                              <Award className="h-4 w-4 text-blue-600" />
                                              <span className="text-sm">{facultyDetail?.qualification || "Not provided"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                              <Briefcase className="h-4 w-4 text-blue-600" />
                                              <span className="text-sm">{facultyDetail?.experience || "Not provided"}</span>
                                            </div>
                                          </div>

                                          {/* Assigned Courses */}
                                          <div className="mt-4">
                                            <div className="flex items-center gap-2 mb-3">
                                              <ListChecks className="h-5 w-5 text-blue-600" />
                                              <h6 className="font-semibold text-gray-900">
                                                Assigned Courses ({facultyCourses.length})
                                              </h6>
                                            </div>
                                            {facultyCourses.length === 0 ? (
                                              <p className="text-gray-500 text-sm italic">No courses assigned yet.</p>
                                            ) : (
                                              <div className="grid grid-cols-1 gap-2">
                                                {facultyCourses.map((c) => (
                                                  <div 
                                                    key={c.id || c.course_id} 
                                                    className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-200 transition-colors"
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                          {c.name || c.course_name}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                          <span className="text-xs text-gray-600">
                                                            Code: {c.code || c.course_code || "N/A"}
                                                          </span>
                                                          <span className="text-xs text-gray-600">
                                                            Credits: {c.credit_hours || c.credits || "N/A"}
                                                          </span>
                                                        </div>
                                                      </div>
                                                      {c.student_count && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                          {c.student_count} students
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>


                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Card Footer */}
                                {!facultyDetailId || facultyDetailId !== f.id ? (
                                  <div className="border-t border-gray-100 p-4">
                                    <button
                                      onClick={() => fetchFacultyDetail(f)}
                                      className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                      View Details
                                      <ChevronRight className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Students Tab Content */}
                    {activeTab === "students" && (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search students..."
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              <Filter className="h-4 w-4" />
                              Filter
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              <Download className="h-4 w-4" />
                              Export
                            </button>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Student</th>
                                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Roll Number</th>
                                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Email</th>
                                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Status</th>
                                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {studentList.length === 0 ? (
                                  <tr>
                                    <td colSpan="5" className="py-12 text-center">
                                      <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                                      <p className="text-gray-500">No students are currently enrolled in this department.</p>
                                    </td>
                                  </tr>
                                ) : (
                                  studentList.map((s) => (
                                    <tr key={s.id || s.student_id || s.roll_number || s.personal_email} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                                            <GraduationCap className="h-5 w-5 text-white" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-900">{s.name || s.full_name}</p>
                                            <p className="text-sm text-gray-500">Student</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4 px-6">
                                        <p className="font-medium text-gray-700">{s.roll_number || "N/A"}</p>
                                      </td>
                                      <td className="py-4 px-6">
                                        <p className="text-gray-700 truncate max-w-[200px]">{s.personal_email || s.email}</p>
                                      </td>
                                      <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                          Active
                                        </span>
                                      </td>
                                      <td className="py-4 px-6">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                          View Profile
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Courses Tab Content */}
                    {activeTab === "courses" && (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search courses..."
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              <Filter className="h-4 w-4" />
                              Filter
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              <Download className="h-4 w-4" />
                              Export
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {courseList.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Available</h3>
                              <p className="text-gray-500">No courses are currently offered in this department.</p>
                            </div>
                          ) : (
                            courseList.map((c) => (
                              <div
                                key={c.id}
                                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
                                    <BookOpen className="h-6 w-6 text-white" />
                                  </div>
                                  <button className="text-gray-400 hover:text-purple-600 transition-colors">
                                    <Eye className="h-5 w-5" />
                                  </button>
                                </div>
                                <h4 className="font-semibold text-gray-900 text-lg mb-1">{c.name || c.course_name}</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Course Code</p>
                                    <p className="font-medium text-gray-700">{c.code || c.course_code || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Credit Hours</p>
                                    <p className="font-medium text-gray-700">{c.credit_hours || c.credits || "N/A"}</p>
                                  </div>
                                </div>

                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">
                      {activeTab === "faculty" ? facultyList.length :
                       activeTab === "students" ? studentList.length :
                       courseList.length}
                    </span> {activeTab}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={closeDepartmentView}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close Dashboard
                    </button>
                    <button
                      onClick={() => handleAccessDepartment(selectedDeptData)}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-colors"
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards - Only shown when no department is selected */}
        {!selectedDept && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available to Access</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Your Department</p>
                  <p className="text-2xl font-bold text-gray-900">{coordinatorDeptName ? "1" : "0"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}