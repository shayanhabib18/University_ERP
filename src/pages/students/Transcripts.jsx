// import { useState } from "react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// export default function Transcripts() {
//   const [showTranscript, setShowTranscript] = useState(false);
//   const [isDownloading, setIsDownloading] = useState(false);

//   const transcriptData = {
//     name: "Shayan Habib",
//     studentId: "FA21-BSSE-0128",
//     program: "BS Computer Science",
//     semesters: [
//       {
//         session: "Fall 2023",
//         gpa: "3.67",
//         courses: [
//           { code: "CS101", name: "Intro to Programming", grade: "A" },
//           { code: "MATH123", name: "Calculus", grade: "B+" }
//         ]
//       },
//       {
//         session: "Spring 2024",
//         gpa: "3.45",
//         courses: [
//           { code: "CS240", name: "Data Structures", grade: "B" },
//           { code: "ENG101", name: "English", grade: "A" }
//         ]
//       }
//     ],
//     cgpa: "3.56"
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       {!showTranscript ? (
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4 text-indigo-700">Transcript Generator</h2>
//           <button
//             onClick={() => setShowTranscript(true)}
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
//           >
//             Generate Transcript
//           </button>
//         </div>
//       ) : (
//         <>
//           <div id="transcript-content" className="bg-white p-6 rounded-xl shadow-md">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h2 className="text-2xl font-bold text-indigo-700">🎓 Transcript</h2>
//                 <p className="text-gray-700">Name: {transcriptData.name}</p>
//                 <p className="text-gray-700">Student ID: {transcriptData.studentId}</p>
//                 <p className="text-gray-700 mb-4">Program: {transcriptData.program}</p>
//               </div>
//               <img
//                 src="/images/profiles/profileimg.jpeg"
//                 alt="Student"
//                 className="w-24 h-24 rounded-full object-cover border"
//               />
//             </div>

//             {transcriptData.semesters.map((sem, idx) => (
//               <div key={idx} className="mb-6">
//                 <h3 className="text-lg font-semibold text-indigo-600 mb-2">{sem.session}</h3>
//                 <table className="w-full text-sm border">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="px-2 py-1 text-left">Course Code</th>
//                       <th className="px-2 py-1 text-left">Course Name</th>
//                       <th className="px-2 py-1 text-left">Grade</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {sem.courses.map((course, i) => (
//                       <tr key={i} className="border-t">
//                         <td className="px-2 py-1">{course.code}</td>
//                         <td className="px-2 py-1">{course.name}</td>
//                         <td className="px-2 py-1">{course.grade}</td>
//                       </tr>
//                     ))}
//                     <tr>
//                       <td colSpan="2" className="text-right font-semibold px-2 py-1">
//                         Semester GPA:
//                       </td>
//                       <td className="px-2 py-1 font-semibold text-indigo-600">{sem.gpa}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             ))}

//             <div className="mt-4 text-right text-green-700 text-xl font-bold">
//               Cumulative GPA: {transcriptData.cgpa}
//             </div>
//           </div>

//           <div className="text-center mt-6">
//             <button
//               // Functionality removed
//               onClick={() => alert("Download is disabled for now.")}
//               disabled={isDownloading}
//               className={`px-6 py-3 rounded-lg font-medium text-white ${
//                 isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//               }`}
//             >
//               Download PDF
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
