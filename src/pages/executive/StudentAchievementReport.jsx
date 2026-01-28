import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { GraduationCap, Loader, AlertCircle } from "lucide-react";

export default function StudentAchievementReport() {
  const [gpaDistribution, setGpaDistribution] = useState([]);
  const [gpaStats, setGpaStats] = useState({
    totalStudents: 0,
    avgGPA: 0,
    distinction: 0,
    merit: 0,
    pass: 0,
    belowPass: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

  useEffect(() => {
    const fetchStudentGPAData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("executiveToken") || localStorage.getItem("facultyToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch all students
        const response = await fetch("http://localhost:5000/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch student data");
        }

        const studentsData = await response.json();
        const students = Array.isArray(studentsData) ? studentsData : studentsData.data || [];

        // Fetch GPA data for each student
        const studentGPAs = await Promise.all(
          students.map(async (student) => {
            try {
              // Try primary endpoint - corrected to /students/academic-records/...
              let transcriptData = [];
              const transcriptRes = await fetch(
                `http://localhost:5000/students/academic-records/student/${student.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
              if (transcriptRes.ok) {
                transcriptData = await transcriptRes.json();
              }
              
              console.log(`Student ${student.id} academic-records data:`, transcriptData);
              
              // If no data, try alternative endpoint
              if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
                console.log(`Trying alternative endpoint for student ${student.id}...`);
                const rstRes = await fetch(
                  `http://localhost:5000/rst/student/${student.id}/transcript`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                
                if (rstRes.ok) {
                  const rstData = await rstRes.json();
                  transcriptData = Array.isArray(rstData) ? rstData : [];
                  console.log(`Student ${student.id} RST transcript data:`, transcriptData);
                }
              }
              
              // Calculate GPA from transcript
              const gpa = calculateGPA(transcriptData);
              console.log(`Student ${student.id} calculated GPA:`, gpa);
              
              return {
                id: student.id,
                name: student.full_name || "Unknown",
                rollNo: student.roll_number,
                gpa: gpa,
              };
            } catch (err) {
              console.error(`Error fetching transcript for student ${student.id}:`, err);
              return {
                id: student.id,
                name: student.full_name || "Unknown",
                rollNo: student.roll_number,
                gpa: 0,
              };
            }
          })
        );

        // Calculate distribution
        const gradePoints = {
          "A+": 4.0, A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7,
          "C+": 2.3, C: 2.0, "C-": 1.7, "D+": 1.3, D: 1.0, F: 0.0,
        };

        let distinction = 0, merit = 0, pass = 0, belowPass = 0;
        let totalGPA = 0;

        studentGPAs.forEach((student) => {
          totalGPA += student.gpa;
          if (student.gpa >= 3.7) distinction++;
          else if (student.gpa >= 3.3) merit++;
          else if (student.gpa >= 2.5) pass++;
          else belowPass++;
        });

        const avgGPA = studentGPAs.length > 0 ? (totalGPA / studentGPAs.length).toFixed(2) : 0;

        const distribution = [
          { name: "Distinction (≥3.7 GPA)", value: distinction, percentage: ((distinction / studentGPAs.length) * 100).toFixed(1) },
          { name: "Merit (3.3–3.6 GPA)", value: merit, percentage: ((merit / studentGPAs.length) * 100).toFixed(1) },
          { name: "Pass (2.5–3.2 GPA)", value: pass, percentage: ((pass / studentGPAs.length) * 100).toFixed(1) },
          { name: "Below Pass (<2.5 GPA)", value: belowPass, percentage: ((belowPass / studentGPAs.length) * 100).toFixed(1) },
        ];

        setGpaDistribution(distribution);
        setGpaStats({
          totalStudents: studentGPAs.length,
          avgGPA: avgGPA,
          distinction,
          merit,
          pass,
          belowPass,
        });
      } catch (err) {
        console.error("Error fetching GPA data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentGPAData();
  }, []);

  const calculateGPA = (transcriptData) => {
    const gradePoints = {
      "A+": 4.0, A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7,
      "C+": 2.3, C: 2.0, "C-": 1.7, "D+": 1.3, D: 1.0, F: 0.0,
    };

    const courses = Array.isArray(transcriptData) ? transcriptData : [];
    console.log("calculateGPA - courses array:", courses);
    console.log("calculateGPA - courses length:", courses.length);
    
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course, index) => {
      const grade = course.grade || "F";
      const credits = Number(course.credit_hours) || 0;
      
      console.log(`Course ${index}:`, { grade, credits, course });
      
      if (credits > 0) {
        const gradePoint = gradePoints[grade.trim().toUpperCase()] || 0;
        console.log(`Grade point for ${grade}: ${gradePoint}`);
        totalPoints += gradePoint * credits;
        totalCredits += credits;
      }
    });

    console.log("calculateGPA - totalPoints:", totalPoints, "totalCredits:", totalCredits);
    const result = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
    console.log("calculateGPA - final result:", result);
    return result;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 mb-10 flex items-center justify-center py-20">
        <div className="text-center">
          <Loader className="animate-spin text-green-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600">Loading Student Achievement Report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle size={24} />
          <h2 className="text-xl font-semibold">Error Loading Report</h2>
        </div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{gpaStats.totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Average GPA</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{gpaStats.avgGPA}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Distinction (≥3.7)</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{gpaStats.distinction}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
          <p className="text-gray-600 text-sm">Merit (3.3-3.6)</p>
          <p className="text-3xl font-bold text-blue-500 mt-2">{gpaStats.merit}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <p className="text-gray-600 text-sm">Pass (2.5-3.2)</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{gpaStats.pass}</p>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap className="text-green-600 w-8 h-8" />
          <h2 className="text-2xl font-semibold text-gray-800">Student Achievement Report</h2>
        </div>

        <p className="text-gray-600 mb-8">
          Distribution of student performance based on GPA ranges across all enrolled students.
        </p>

        {/* Pie Chart */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">GPA Distribution</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={gpaDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {gpaDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} students`, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistics Table */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Summary Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Count</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {gpaDistribution.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{item.name}</td>
                    <td className="px-4 py-3 font-semibold">{item.value}</td>
                    <td className="px-4 py-3 font-semibold">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <strong className="text-blue-900">Summary:</strong>
          <p className="text-blue-800 text-sm mt-2">
            Out of {gpaStats.totalStudents} students, {gpaStats.distinction} achieved distinction, {gpaStats.merit} achieved merit, {gpaStats.pass} passed, and {gpaStats.belowPass} are below passing. The average GPA is {gpaStats.avgGPA}.
          </p>
        </div>
      </div>
    </div>
  );
}
