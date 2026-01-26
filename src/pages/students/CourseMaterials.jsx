import React, { useState, useEffect } from "react";
import { Download, FileText, Calendar, BookOpen, Loader, Eye } from "lucide-react";

export default function CourseMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);

  // Fetch courses and their materials
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const infoRaw = localStorage.getItem("student_info");
      const info = infoRaw ? JSON.parse(infoRaw) : null;
      const studentId = info?.id;

      // Fetch enrollments to get courses for current student
      const enrollResponse = await fetch(`http://localhost:5000/students/enrollments/student/${studentId}`);

      if (enrollResponse.ok) {
        const enrollments = await enrollResponse.json();
        const courseIds = enrollments.map((e) => e.course_id);
        setCourses(enrollments);

        // Fetch materials for all courses
        const materialsResponse = await fetch(
          "http://localhost:5000/api/course-materials"
        );

        if (materialsResponse.ok) {
          const allMaterials = await materialsResponse.json();
          // Filter materials for enrolled courses
          const filteredMaterials = allMaterials.filter((m) =>
            courseIds.includes(m.course_id)
          );
          setMaterials(filteredMaterials);
        }
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Failed to load course materials");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      // Fetch the file as a blob to force download
      const response = await fetch(material.file_path || material.url);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = material.name || "material";
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleView = (material) => {
    // Open the file in a new tab for viewing
    window.open(material.file_path || material.url, "_blank");
  };

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.course_id === courseId);
    return course ? course.course_name : "Unknown Course";
  };

  const groupedMaterials = materials.reduce((acc, material) => {
    const courseId = material.course_id;
    if (!acc[courseId]) {
      acc[courseId] = [];
    }
    acc[courseId].push(material);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-center gap-3">
          <Loader className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-600">Loading course materials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-2 rounded-lg">
          <FileText className="text-blue-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-blue-700">Course Materials</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No course materials available yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Faculty will upload materials here for your enrolled courses
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMaterials).map(([courseId, courseMaterials]) => (
            <div key={courseId} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Course Header */}
              <div
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 cursor-pointer hover:bg-blue-100 transition"
                onClick={() =>
                  setSelectedCourse(
                    selectedCourse === courseId ? null : courseId
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-blue-600" size={20} />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {getCourseName(courseId)}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {courseMaterials.length} material(s)
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-blue-600 transition-transform ${
                      selectedCourse === courseId ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </div>

              {/* Materials List */}
              {selectedCourse === courseId && (
                <div className="bg-white divide-y divide-gray-200">
                  {courseMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-blue-100 p-2 rounded-lg mt-1">
                            <FileText className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {material.name}
                            </h3>
                            {material.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {material.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              {material.size && (
                                <span>{material.size}</span>
                              )}
                              {material.uploaded_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {new Date(material.uploaded_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleView(material)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition whitespace-nowrap"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(material)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition whitespace-nowrap"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={fetchMaterials}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition"
        >
          Refresh Materials
        </button>
      </div>
    </div>
  );
}
