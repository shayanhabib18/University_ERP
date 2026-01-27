import { useEffect, useState } from "react";
import { Download, Eye, FileText, Loader, Search } from "lucide-react";
import { jsPDF } from "jspdf";

// Coordinator transcript view aligned with chair portal
export default function CoordinatorTranscripts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentName, setDepartmentName] = useState("N/A");

  const gradePoints = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
  };

  const getGradePoint = (grade) => {
    if (!grade) return null;
    const key = String(grade).trim().toUpperCase();
    return Object.prototype.hasOwnProperty.call(gradePoints, key) ? gradePoints[key] : null;
  };

  const formatGpa = (value) => {
    if (value === null || value === undefined) return "N/A";
    const num = Number(value);
    if (Number.isNaN(num)) return "N/A";
    return num.toFixed(2);
  };

  const mapTranscript = (data) => {
    const items = Array.isArray(data) ? data : [];
    return items.map((item) => {
      // Handle courseInfo - could be object or primitive
      const courseInfo = typeof item.course === 'object' ? item.course : (item.course_info || item.course_details || {});
      const rstData = item.rst_data || item.rstData || {};

      const grade =
        item.grade ||
        item.overall_grade ||
        item.final_grade ||
        item.result_grade ||
        item.letter_grade ||
        item.grade_letter ||
        item.result ||
        rstData.grade ||
        rstData.grade_letter ||
        rstData.result_grade ||
        rstData.letter_grade ||
        rstData.final_grade ||
        rstData.gradeValue ||
        null;

      // Extract course name from all possible locations
      const courseName =
        (typeof courseInfo === 'object' ? courseInfo.course_title : null) ||
        (typeof courseInfo === 'object' ? courseInfo.title : null) ||
        (typeof courseInfo === 'object' ? courseInfo.name : null) ||
        (typeof courseInfo === 'object' ? courseInfo.course_name : null) ||
        item.course_title ||
        item.courseName ||
        item.course_name ||
        item.title ||
        (typeof item.course === 'string' ? item.course : null) ||
        rstData.course_title ||
        rstData.title ||
        rstData.course_name ||
        "Unknown Course";

      const code =
        (typeof courseInfo === 'object' ? courseInfo.course_code : null) ||
        (typeof courseInfo === 'object' ? courseInfo.code : null) ||
        item.course_code ||
        item.code ||
        rstData.course_code ||
        "";

      const creditHours =
        Number(
          item.credit_hours ||
            item.creditHours ||
            (typeof courseInfo === 'object' ? courseInfo.credit_hours : null) ||
            (typeof courseInfo === 'object' ? courseInfo.creditHours : null) ||
            rstData.credit_hours ||
            rstData.creditHours ||
            0
        ) || 0;

      const semester =
        item.semester ||
        item.semester_id ||
        item.semester_number ||
        (typeof courseInfo === 'object' ? courseInfo.semester : null) ||
        (typeof courseInfo === 'object' ? courseInfo.semester_id : null) ||
        (typeof courseInfo === 'object' ? courseInfo.semester_number : null) ||
        rstData.semester ||
        rstData.semester_id ||
        rstData.semester_number ||
        "N/A";

      const academicYear =
        item.academic_year ||
        item.academicYear ||
        (typeof courseInfo === 'object' ? courseInfo.academic_year : null) ||
        rstData.academic_year ||
        rstData.academicYear ||
        null;

      return {
        course: courseName,
        code: code || "",
        grade: grade || "N/A",
        creditHours,
        semester,
        academicYear,
      };
    });
  };

  const calcGpa = (transcript) => {
    const courses = Array.isArray(transcript) ? transcript : [];
    const totals = courses.reduce(
      (acc, c) => {
        const gp = getGradePoint(c.grade);
        const ch = Number(c.creditHours) || 0;
        if (gp !== null && ch > 0) {
          acc.points += gp * ch;
          acc.credits += ch;
        }
        return acc;
      },
      { points: 0, credits: 0 }
    );

    if (!totals.credits) return 0;
    return Number(totals.points / totals.credits).toFixed(2);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const token =
          localStorage.getItem("coordinator_token") || localStorage.getItem("facultyToken");
        const headers = { Authorization: `Bearer ${token}` };

        const profileRes = await fetch("http://localhost:5000/faculties/profile", { headers });
        if (!profileRes.ok) {
          setError("Failed to fetch profile");
          setLoading(false);
          return;
        }

        const profile = await profileRes.json();
        const departmentId = profile.department_id;

        if (departmentId) {
          try {
            const deptRes = await fetch(`http://localhost:5000/departments/${departmentId}`, {
              headers,
            });
            if (deptRes.ok) {
              const dept = await deptRes.json();
              setDepartmentName(dept.name || "N/A");
            }
          } catch (err) {
            // non-fatal
          }
        }

        const studentsRes = await fetch(
          "http://localhost:5000/faculties/coordinator/department-students",
          { headers }
        );

        if (!studentsRes.ok) {
          setError("Failed to fetch students");
          setLoading(false);
          return;
        }

        const studentsData = await studentsRes.json();

        const enriched = await Promise.all(
          studentsData.map(async (student) => {
            try {
              const transcriptRes = await fetch(
                `http://localhost:5000/academic-records/student/${student.id}`,
                { headers }
              );
              const transcriptData = transcriptRes.ok ? await transcriptRes.json() : [];
              const transcript = mapTranscript(transcriptData);
              const gpa = calcGpa(transcript);

              return {
                ...student,
                name: student.full_name || student.name || "Unknown",
                rollNo: student.roll_number || student.rollNo || "N/A",
                transcript,
                gpa,
                email: student.personal_email || student.email || "N/A",
                phone: student.student_phone || student.mobile || student.phone || "N/A",
                dob: student.date_of_birth || student.dob || "N/A",
                cnic: student.cnic || "N/A",
                fatherName: student.father_name || "N/A",
                address: student.permanent_address || student.address || "N/A",
                departmentName,
              };
            } catch (err) {
              return {
                ...student,
                name: student.full_name || student.name || "Unknown",
                rollNo: student.roll_number || student.rollNo || "N/A",
                transcript: [],
                gpa: 0,
                email: student.personal_email || student.email || "N/A",
                phone: student.student_phone || student.mobile || student.phone || "N/A",
                dob: student.date_of_birth || student.dob || "N/A",
                cnic: student.cnic || "N/A",
                fatherName: student.father_name || "N/A",
                address: student.permanent_address || student.address || "N/A",
                departmentName,
              };
            }
          })
        );

        setStudents(enriched);
        setLoading(false);
      } catch (err) {
        setError("Failed to load transcripts");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = async (student) => {
    try {
      const text = buildTranscriptText(student);
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert("Transcript copied to clipboard!");
      } else {
        alert("Clipboard not available in this browser.");
      }
    } catch (err) {
      alert("Failed to copy transcript.");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      (s.rollNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTranscript = async (student) => {
    try {
      setError(null);
      setModalLoading(true);
      const token =
        localStorage.getItem("coordinator_token") || localStorage.getItem("facultyToken");
      const headers = { Authorization: `Bearer ${token}` };

      const profileRes = await fetch(`http://localhost:5000/students/${student.id}`, { headers });
      const profile = profileRes.ok ? await profileRes.json() : {};

      const transcriptRes = await fetch(
        `http://localhost:5000/academic-records/student/${student.id}`,
        { headers }
      );
      const transcriptData = transcriptRes.ok ? await transcriptRes.json() : [];
      let transcript = mapTranscript(transcriptData);

      if (!transcript || transcript.length === 0) {
        const coursesRes = await fetch(`http://localhost:5000/students/${student.id}/courses`, {
          headers,
        });
        const coursesData = coursesRes.ok ? await coursesRes.json() : [];
        transcript = mapTranscript(coursesData);
      }

      const hasGrades = Array.isArray(transcript)
        ? transcript.some((t) => t.grade && t.grade !== "N/A")
        : false;

      if (!hasGrades) {
        const rstRes = await fetch(`http://localhost:5000/rst/student/${student.id}/transcript`, {
          headers,
        });
        const rstData = rstRes.ok ? await rstRes.json() : [];
        const rstTranscript = mapTranscript(rstData);
        if (rstTranscript.length > 0) transcript = rstTranscript;
      }

      const gpa = calcGpa(transcript);

      setSelectedStudent({
        ...student,
        ...profile,
        name: profile.full_name || student.full_name || student.name || "Unknown",
        rollNo: profile.roll_number || student.roll_number || student.rollNo || "N/A",
        transcript,
        gpa,
        email: profile.personal_email || profile.email || student.personal_email || student.email || "N/A",
        phone: profile.student_phone || student.student_phone || student.phone || "N/A",
        dob: profile.date_of_birth || student.date_of_birth || student.dob || "N/A",
        cnic: profile.cnic || student.cnic || "N/A",
        fatherName: profile.father_name || student.father_name || "N/A",
        address:
          profile.permanent_address ||
          profile.address ||
          student.permanent_address ||
          student.address ||
          "N/A",
        departmentName:
          departmentName || profile.department_name || student.department_name || student.department || "N/A",
      });
    } catch (err) {
      setError("Failed to load transcript");
    } finally {
      setModalLoading(false);
    }
  };

  const generatePDF = (student) => {
    try {
      const doc = new jsPDF();
      const margin = 14;
      const lineHeight = 7;
      let y = 18;

      const text = buildTranscriptText(student);
      const lines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - margin * 2);

      doc.setFont("courier", "normal");
      doc.setFontSize(12);

      lines.forEach((line) => {
        doc.text(line, margin, y);
        y += lineHeight;
        if (y > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 18;
        }
      });

      const filename = `${student.rollNo || student.id}_Transcript_${new Date().getTime()}.pdf`;
      doc.save(filename);
    } catch (err) {
      alert(`Error generating PDF: ${err.message}`);
    }
  };

  const buildTranscriptText = (student) => {
    const lines = [];
    const sep = (char = "=", len = 40) => char.repeat(len);
    const dashSep = (len = 40) => "-".repeat(len);

    lines.push(sep());
    lines.push("STUDENT TRANSCRIPT");
    lines.push(sep());
    lines.push("");

    lines.push("PERSONAL INFORMATION");
    lines.push(dashSep());
    lines.push(`Name: ${student.name || "N/A"}`);
    lines.push(`Email: ${student.email || "N/A"}`);
    lines.push(`Phone: ${student.phone || "N/A"}`);
    lines.push(`Date of Birth: ${student.dob || "N/A"}`);
    lines.push(`CNIC: ${student.cnic || "N/A"}`);
    lines.push(`Father's Name: ${student.fatherName || "N/A"}`);
    lines.push(`Address: ${student.address || "N/A"}`);
    lines.push(`Roll No: ${student.rollNo || "N/A"}`);
    lines.push(`Department: ${student.departmentName || "N/A"}`);
    lines.push(" ");

    lines.push("ACADEMIC HISTORY");
    lines.push(dashSep());
    lines.push("");

    const transcript = Array.isArray(student.transcript) ? student.transcript : [];

    const grouped = {};
    let totalCredits = 0;
    let totalPoints = 0;

    transcript.forEach((item) => {
      const semKey = item.semester ?? "N/A";
      const credits = item.creditHours || 0;
      const gp = getGradePoint(item.grade);
      const coursePoints = gp !== null ? gp * credits : 0;

      if (!grouped[semKey]) grouped[semKey] = { courses: [], credits: 0, points: 0 };
      grouped[semKey].courses.push(item);
      grouped[semKey].credits += credits;
      grouped[semKey].points += coursePoints;

      totalCredits += credits;
      totalPoints += coursePoints;
    });

    const stats = Object.entries(grouped).map(([semester, info]) => ({
      semester,
      courses: info.courses,
      credits: info.credits,
      points: info.points,
      gpa: info.credits > 0 ? info.points / info.credits : null,
    }));

    const sortedSemesters = [...stats].sort((a, b) => {
      const aNum = Number(a.semester);
      const bNum = Number(b.semester);
      const aIsNum = !Number.isNaN(aNum);
      const bIsNum = !Number.isNaN(bNum);
      if (aIsNum && bIsNum) return aNum - bNum;
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return String(a.semester).localeCompare(String(b.semester));
    });

    if (sortedSemesters.length === 0) {
      lines.push("No academic records found.");
    } else {
      sortedSemesters.forEach((sem) => {
        lines.push(
          `Semester ${sem.semester} (Credits: ${sem.credits || 0})`
        );
        lines.push(dashSep());
        sem.courses.forEach((c) => {
          const code = (c.code || "").padEnd(10, " ");
          const title = (c.course || "Unknown Course").padEnd(30, " ");
          const grade = (c.grade || "N/A").padEnd(4, " ");
          const credits = `${c.creditHours || 0} Credits`;
          lines.push(`${code} | ${title} | ${grade} | ${credits}`);
        });
        lines.push("");
      });
    }

    lines.push(sep());
    lines.push("SUMMARY");
    lines.push(sep());
    lines.push(`Total Credits: ${totalCredits}`);
    lines.push(`CGPA: ${formatGpa(totalPoints && totalCredits ? totalPoints / totalCredits : null)}`);
    lines.push(`Generated on: ${new Date().toLocaleDateString()}`);

    return lines.join("\n");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <FileText className="text-blue-600" size={28} /> Student Transcripts
        </h2>

        {!loading && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Roll No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
            <p className="text-gray-600">Loading student transcripts...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-2"> Error Loading Transcripts</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 uppercase text-sm">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Roll No</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4 font-medium text-gray-800">{student.name}</td>
                    <td className="p-4 text-gray-600">{student.rollNo || "N/A"}</td>
                    <td className="p-4 flex justify-center gap-3">
                      <button
                        onClick={() => handleViewTranscript(student)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition"
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        onClick={() => generatePDF(student)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition"
                      >
                        <Download size={16} /> Download
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No students found in your department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transcript Details</h2>
              <button className="close-btn" onClick={() => setSelectedStudent(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <p>Loading transcript...</p>
              ) : (
                <>
                  <div className="transcript-text">
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {buildTranscriptText(selectedStudent)}
                    </pre>
                  </div>

                  <div className="modal-actions">
                    <button onClick={() => generatePDF(selectedStudent)} className="download-btn">
                      <Download size={16} /> Download PDF
                    </button>
                    <button className="copy-btn" onClick={() => handleCopy(selectedStudent)}>
                      Copy Transcript
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}