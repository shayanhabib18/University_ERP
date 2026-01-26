import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { X, Download, ArrowLeft } from "lucide-react";

const API_URL = "http://localhost:5000";

export default function StudentRSTView() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [rstData, setRstData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);

  useEffect(() => {
    const fetchRST = async () => {
      try {
        setLoading(true);
        
        // Get student info from localStorage
        const studentInfoStr = localStorage.getItem("student_info");
        if (!studentInfoStr) {
          throw new Error("Student information not found. Please log in again.");
        }

        const student = JSON.parse(studentInfoStr);
        setStudentInfo(student);

        console.log("Fetching RST for student:", student.id, "course:", courseId);

        // Fetch RST from backend
        const fetchUrl = `${API_URL}/rst/student/${student.id}/course/${courseId}`;
        console.log("Fetch URL:", fetchUrl);
        
        const response = await fetch(fetchUrl);
        
        console.log("Response status:", response.status);

        if (response.status === 404) {
          setError("Result not yet published by your instructor");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.text();
          console.error("API Error:", response.status, errorData);
          throw new Error(`Failed to fetch result: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("RST Data received:", data);
        
        setRstData(data.rst_data);
        
        // Fetch course info if needed - for now we'll just use what we have
        // Course info could be passed from the previous page or fetched separately
        setError(null);
      } catch (err) {
        console.error("Error fetching RST:", err);
        setError(err.message || "Failed to load result");
      } finally {
        setLoading(false);
      }
    };

    fetchRST();
  }, [courseId]);

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

  const calculateTotalPercentage = () => {
    if (!rstData) return 0;
    let total = 0;
    rstData.components.forEach(comp => {
      const mark = rstData.marks[comp.id];
      if (mark && mark !== 'Abs') {
        const weightedMark = (parseFloat(mark) / comp.maxMarks) * comp.weightage;
        total += weightedMark;
      }
    });
    return total.toFixed(2);
  };

  const getStatus = () => {
    const grade = calculateGrade();
    return grade === 'F' ? 'FAIL' : 'PASS';
  };

  const getStatusColor = () => {
    const status = getStatus();
    return status === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your result...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Courses
          </button>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Result Not Available</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Return to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Courses
          </button>
        </div>

        {/* Result Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Result Summary Table
              </h1>
              <p className="text-gray-600">
                {courseInfo?.name || "Course"} - {courseInfo?.code || ""}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Roll No: {studentInfo?.roll_number || studentInfo?.enrollment || "N/A"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Final Grade</div>
              <div className="text-4xl font-bold text-indigo-600 mb-3">
                {calculateGrade()}
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block mb-3 ${getStatusColor()}`}>
                {getStatus()}
              </span>
              <div className="text-sm text-gray-500 mt-3">
                Total: {calculateTotalPercentage()}%
              </div>
            </div>
          </div>

          {/* RST Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                {/* Header Row */}
                <tr className="bg-indigo-900 text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Component</th>
                  {rstData?.components.map(comp => (
                    <th key={comp.id} className="border border-gray-300 px-4 py-3 text-center font-semibold whitespace-nowrap">
                      {comp.name}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold bg-indigo-800">Total</th>
                </tr>

                {/* Max Marks Row */}
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Max Marks</td>
                  {rstData?.components.map(comp => (
                    <td key={comp.id} className="border border-gray-300 px-4 py-2 text-center">
                      {comp.maxMarks}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-200">
                    {rstData?.components.reduce((sum, c) => sum + c.maxMarks, 0)}
                  </td>
                </tr>

                {/* Weightage Row */}
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">Weightage (%)</td>
                  {rstData?.components.map(comp => (
                    <td key={comp.id} className="border border-gray-300 px-4 py-2 text-center">
                      {comp.weightage}%
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-200">
                    100%
                  </td>
                </tr>
              </thead>

              <tbody>
                {/* Student Marks Row */}
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Your Marks</td>
                  {rstData?.components.map(comp => (
                    <td key={comp.id} className="border border-gray-300 px-4 py-3 text-center font-medium text-indigo-600">
                      {rstData.marks[comp.id] || '-'}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-3 text-center font-bold text-lg bg-green-50">
                    {calculateTotalPercentage()}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
