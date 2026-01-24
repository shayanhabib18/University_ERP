import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Upload,
  FileText,
  Clock,
  X,
  Edit,
  Eye,
  ChevronRight,
  CheckCircle,
  Download,
  Calendar,
  UserCheck,
  BookMarked,
  Plus,
  Trash2,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facultyId, setFacultyId] = useState(null);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [showRSTModal, setShowRSTModal] = useState(false);
  const [rstData, setRstData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const activeCourse = courses.find((c) => c.id === activeCourseId);

  // Fetch faculty courses from database
  useEffect(() => {
    fetchFacultyCourses();
  }, []);

  const fetchFacultyCourses = async () => {
    try {
      // Get faculty ID from backend session/auth token
      // First, get the current faculty profile using the auth token
      const token = localStorage.getItem('facultyToken');
      
      if (!token) {
        console.warn("No faculty token found - user not logged in");
        setLoading(false);
        return;
      }

      // Get faculty profile from backend (you should have this endpoint)
      const response = await fetch(`${API_URL}/faculties/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("Failed to get faculty profile");
        setLoading(false);
        return;
      }

      const facultyProfile = await response.json();
      const facultyId = facultyProfile.id;
      setFacultyId(facultyId);
      
      // Now fetch assigned courses
      const coursesResponse = await fetch(`${API_URL}/faculty-courses/faculty/${facultyId}`);
      const data = await coursesResponse.json();
      
      // Transform data to match the component structure
      const transformedCourses = data.map(item => ({
        id: item.course.id,
        name: item.course.name,
        code: item.course.code,
        semester: `Semester ${item.course.semester?.number || 'N/A'}`,
        credits: item.course.credit_hours || 0,
        studentCount: item.student_count || 0,
        students: [], // Will be populated when course is selected
        materials: [],
        attendance: {},
        rst: [],
        studentRSTs: {},
      }));
      
      setCourses(transformedCourses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching faculty courses:", error);
      setLoading(false);
    }
  };

  /* ---------------- MATERIAL UPLOAD ---------------- */
  const uploadMaterial = () => {
    if (!selectedFile) return;
    const newMaterial = {
      id: Date.now().toString(),
      name: selectedFile.name,
      date: new Date().toISOString().slice(0, 10),
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
    };

    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId
          ? { ...c, materials: [...c.materials, newMaterial] }
          : c
      )
    );
    setSelectedFile(null);
  };

  /* ---------------- ATTENDANCE ---------------- */
  const markAttendance = (studentId, status) => {
    setCourses(prev =>
      prev.map(c =>
        c.id === activeCourseId
          ? {
              ...c,
              attendance: {
                ...c.attendance,
                [selectedDate]: {
                  ...(c.attendance[selectedDate] || {}),
                  [studentId]: status,
                },
              },
            }
          : c
      )
    );
  };

  const loadCourseDetails = async (courseId) => {
    try {
      if (!facultyId) return;
      const resp = await fetch(`${API_URL}/faculty-courses/faculty/${facultyId}/course/${courseId}`);
      if (!resp.ok) {
        console.error("Failed to load course details");
        return;
      }
      const details = await resp.json();
      setCourses(prev => prev.map(c => c.id === courseId ? {
        ...c,
        studentCount: details.students_count ?? c.studentCount,
        students: details.students || [],
      } : c));
    } catch (error) {
      console.error("Error loading course details", error);
    }
  };

  /* ---------------- RST ---------------- */
  const createRST = (student) => {
    if (!activeCourse || !student) return;
    
    // Initialize RST structure
    const components = [
      { id: 'a1', name: 'Assignments1', maxMarks: 10, weightage: 5 },
      { id: 'a2', name: 'Assignments2', maxMarks: 10, weightage: 5 },
      { id: 'a3', name: 'Assignments3', maxMarks: 10, weightage: 5 },
      { id: 'a4', name: 'Assignments4', maxMarks: 10, weightage: 5 },
      { id: 'q1', name: 'Quizes1', maxMarks: 10, weightage: 2 },
      { id: 'q2', name: 'Quizes2', maxMarks: 10, weightage: 4 },
      { id: 'q3', name: 'Quizes3', maxMarks: 10, weightage: 4 },
      { id: 'mt', name: 'Mid Term', maxMarks: 50, weightage: 20 },
      { id: 'ft', name: 'Final Term', maxMarks: 50, weightage: 30 },
      { id: 'pp', name: 'Project/Presentation', maxMarks: 20, weightage: 20 },
    ];

    // Initialize marks for this specific student
    const marks = {};
    components.forEach(comp => {
      marks[comp.id] = '';
    });

    setSelectedStudent(student);
    setRstData({
      components,
      marks
    });
    setIsEditMode(true);
    setShowRSTModal(true);
  };

  const viewRST = (student) => {
    if (!activeCourse || !student) return;
    
    // Get existing RST data for this student
    const existingRST = activeCourse.studentRSTs[student.id];
    
    if (!existingRST) {
      alert('No RST found for this student');
      return;
    }

    setSelectedStudent(student);
    setRstData(existingRST);
    setIsEditMode(false);
    setShowRSTModal(true);
  };

  const saveRST = () => {
    if (!selectedStudent || !rstData || !activeCourseId) return;

    setCourses(prev =>
      prev.map(c =>
        c.id === activeCourseId
          ? {
              ...c,
              studentRSTs: {
                ...c.studentRSTs,
                [selectedStudent.id]: rstData
              }
            }
          : c
      )
    );

    alert('RST saved successfully!');
    setShowRSTModal(false);
    setIsEditMode(false);
  };

  const enableEditMode = () => {
    setIsEditMode(true);
  };

  const updateMark = (componentId, value) => {
    if (!isEditMode) return;
    
    setRstData(prev => ({
      ...prev,
      marks: {
        ...prev.marks,
        [componentId]: value
      }
    }));
  };

  const updateComponent = (componentId, field, value) => {
    if (!isEditMode) return;
    
    setRstData(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === componentId ? { ...comp, [field]: parseFloat(value) || 0 } : comp
      )
    }));
  };

  const calculateGrade = () => {
    if (!rstData) return '';
    let total = 0;
    rstData.components.forEach(comp => {
      const mark = rstData.marks[comp.id];
      if (mark && mark !== 'Abs') {
        const weightedMark = (parseFloat(mark) / comp.maxMarks) * comp.weightage;
        total += weightedMark;
      }
    });
    
    // Calculate grade based on total percentage
    if (total >= 85) return 'A';
    if (total >= 80) return 'A-';
    if (total >= 75) return 'B+';
    if (total >= 70) return 'B';
    if (total >= 65) return 'B-';
    if (total >= 61) return 'C+';
    if (total >= 58) return 'C';
    if (total >= 55) return 'C-';
    if (total >= 50) return 'D';
    return 'F';
  };

  const deleteRST = (rstId) => {
    if (window.confirm("Are you sure you want to delete this RST?")) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === activeCourseId
            ? { ...c, rst: c.rst.filter(r => r.id !== rstId) }
            : c
        )
      );
    }
  };

  /* ---------------- DELETE MATERIAL ---------------- */
  const deleteMaterial = (materialId) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === activeCourseId
            ? { ...c, materials: c.materials.filter(m => m.id !== materialId) }
            : c
        )
      );
    }
  };

  // Check if student has RST
  const hasRST = (studentId) => {
    return activeCourse?.studentRSTs?.[studentId] !== undefined;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            My Courses <span className="text-indigo-600">Management</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your courses, students, materials, and assignments
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {courses.length} Active Courses
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <BookOpen className="text-indigo-600" size={24} />
                </div>
                <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {course.credits} Credits
                </span>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {course.name}
              </h2>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{course.studentCount} Students</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText size={14} />
                  <span>{course.materials.length} Materials</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveCourseId(course.id);
                  loadCourseDetails(course.id);
                  setActiveTab("overview");
                }}
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                <Eye size={16} />
                View Course Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Course Panel */}
      {activeCourse && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Panel Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <BookOpen className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {activeCourse.name}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <BookMarked size={14} />
                      {activeCourse.code}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {activeCourse.semester}
                    </span>
                    <span>•</span>
                    <span>{activeCourse.credits} Credits</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveCourseId(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto px-6">
              {[
                { id: "overview", label: "Overview", icon: <Eye size={16} /> },
                { id: "students", label: "Students", icon: <Users size={16} /> },
                { id: "materials", label: "Materials", icon: <FileText size={16} /> },
                { id: "attendance", label: "Attendance", icon: <Clock size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Users className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Students
                      </h3>
                      <p className="text-sm text-gray-500">Total enrolled</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {activeCourse.studentCount}
                  </p>
                  <button
                    onClick={() => setActiveTab("students")}
                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    View Students <ChevronRight size={16} />
                  </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Materials
                      </h3>
                      <p className="text-sm text-gray-500">Course files</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {activeCourse.materials.length}
                  </p>
                  <button
                    onClick={() => setActiveTab("materials")}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    View Materials <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Registered Students ({activeCourse.studentCount})
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrollment ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          RST
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeCourse.students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-700">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.enrollment}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasRST(student.id) ? (
                              <button
                                onClick={() => viewRST(student)}
                                className="text-sm text-blue-600 hover:text-blue-900 font-medium hover:underline flex items-center gap-1"
                              >
                                <Eye size={14} />
                                View RST
                              </button>
                            ) : (
                              <button
                                onClick={() => createRST(student)}
                                className="text-sm text-indigo-600 hover:text-indigo-900 font-medium hover:underline flex items-center gap-1"
                              >
                                <Plus size={14} />
                                Create RST
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === "materials" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Course Materials ({activeCourse.materials.length})
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                      onClick={uploadMaterial}
                      disabled={!selectedFile}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        selectedFile
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Upload size={16} />
                      Upload
                    </button>
                  </div>
                </div>

                {activeCourse.materials.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                    <p className="text-gray-500">No materials uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Upload your first course material using the button above
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCourse.materials.map((material) => (
                      <div
                        key={material.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="p-2 bg-blue-100 rounded-lg mb-3">
                            <FileText className="text-blue-600" size={20} />
                          </div>
                          <button
                            onClick={() => deleteMaterial(material.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1 truncate">
                          {material.name}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{material.date}</span>
                          <span>{material.size}</span>
                        </div>
                        <button className="mt-4 w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                          <Download size={14} />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="space-y-6">
                {/* Date Picker */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Mark Attendance</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeCourse.students.map(student => {
                        const status = activeCourse.attendance[selectedDate]?.[student.id] || "Absent";
                        return (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.enrollment}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={status}
                                onChange={(e) => markAttendance(student.id, e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                              >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Attendance Summary */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary</h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeCourse.students.map(student => {
                          const allDates = Object.keys(activeCourse.attendance);
                          const presentCount = allDates.filter(date => 
                            activeCourse.attendance[date]?.[student.id] === "Present"
                          ).length;
                          const totalClasses = allDates.length;
                          const absentCount = totalClasses - presentCount;
                          const percentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;
                          
                          return (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{totalClasses}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{presentCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{absentCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${
                                    percentage >= 75 ? 'text-green-600' : 
                                    percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {percentage}%
                                  </span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        percentage >= 75 ? 'bg-green-500' : 
                                        percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RST Modal */}
      {showRSTModal && rstData && activeCourse && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-800">Result Summary Table - {selectedStudent.name}</h2>
                  {!isEditMode && (
                    <button
                      onClick={enableEditMode}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{activeCourse.name} - {activeCourse.code} | {selectedStudent.enrollment}</p>
              </div>
              <button
                onClick={() => {
                  setShowRSTModal(false);
                  setIsEditMode(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-auto flex-1">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    {/* Header Row */}
                    <tr className="bg-blue-900 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">RollNo</th>
                      {rstData.components.map(comp => (
                        <th key={comp.id} className="border border-gray-300 px-4 py-3 text-center font-semibold whitespace-nowrap">
                          {comp.name}
                        </th>
                      ))}
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold bg-blue-800">Grade</th>
                    </tr>

                    {/* Max Marks Row */}
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold">Max Marks</td>
                      {rstData.components.map(comp => (
                        <td key={comp.id} className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={comp.maxMarks}
                            onChange={(e) => updateComponent(comp.id, 'maxMarks', e.target.value)}
                            disabled={!isEditMode}
                            className={`w-full text-center border ${isEditMode ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-transparent'} rounded px-2 py-1`}
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-200">
                        -
                      </td>
                    </tr>

                    {/* Weightage Row */}
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold">Weightage</td>
                      {rstData.components.map(comp => (
                        <td key={comp.id} className="border border-gray-300 px-2 py-2">
                          <input
                            type="number"
                            value={comp.weightage}
                            onChange={(e) => updateComponent(comp.id, 'weightage', e.target.value)}
                            disabled={!isEditMode}
                            className={`w-full text-center border ${isEditMode ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-transparent'} rounded px-2 py-1`}
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-200">
                        -
                      </td>
                    </tr>

                    {/* Column Headers (Assignments, Quizes, etc.) */}
                    <tr className="bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2 font-semibold">Roll No</td>
                      {rstData.components.map(comp => (
                        <td key={comp.id} className="border border-gray-300 px-4 py-2 text-center font-medium">
                          {comp.name}
                        </td>
                      ))}
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold">Grade</td>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Student Row */}
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-medium">{selectedStudent.enrollment}</td>
                      {rstData.components.map(comp => (
                        <td key={comp.id} className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={rstData.marks[comp.id] || ''}
                            onChange={(e) => updateMark(comp.id, e.target.value)}
                            disabled={!isEditMode}
                            className={`w-full text-center border-0 ${isEditMode ? 'focus:ring-2 focus:ring-indigo-500' : 'bg-transparent'} rounded px-2 py-1`}
                            placeholder="0"
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 px-4 py-2 text-center font-bold text-lg bg-green-50">
                        {calculateGrade()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRSTModal(false);
                  setIsEditMode(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                {isEditMode ? 'Cancel' : 'Close'}
              </button>
              {isEditMode && (
                <button
                  onClick={saveRST}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Save RST
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}