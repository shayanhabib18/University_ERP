import { useState } from "react";
import {
  BookOpen,
  Users,
  Plus,
  Upload,
  FileText,
  Clock,
  X,
  Edit,
  Trash,
  Eye,
} from "lucide-react";

export default function Courses() {
  const initialCourses = [
    {
      id: "c1",
      name: "Data Structures",
      code: "CS201",
      semester: "Fall 2025",
      students: [
        { id: "s1", name: "Ali Khan", email: "ali.khan@example.com" },
        { id: "s2", name: "Sara Ahmad", email: "sara.ahmad@example.com" },
      ],
      materials: [
        {
          id: "m1",
          name: "Syllabus.pdf",
          type: "pdf",
          uploadedAt: "2025-01-05",
        },
      ],
      outline:
        "Week 1: Introduction\nWeek 2: Arrays & Linked Lists\nWeek 3: Trees\n...",
      readings: [
        {
          id: "r1",
          title: "CLRS Algorithms",
          author: "Cormen et al.",
          link: "https://example.com/clrs",
        },
      ],
      schedule: [
        {
          id: "sch1",
          type: "Lecture",
          day: "Mon",
          time: "10:00 - 11:30",
          location: "Room A1",
        },
      ],
    },
    {
      id: "c2",
      name: "Operating Systems",
      code: "CS301",
      semester: "Spring 2025",
      students: [{ id: "s3", name: "Zain Malik", email: "zain.malik@example.com" }],
      materials: [],
      outline: "Week 1: Processes\nWeek 2: Threads\n...",
      readings: [],
      schedule: [],
    },
  ];

  const [courses, setCourses] = useState(initialCourses);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [outlineDraft, setOutlineDraft] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState({
    type: "Lecture",
    day: "",
    time: "",
    location: "",
  });
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [activeCourseTab, setActiveCourseTab] = useState("Materials");
  const [readingDraft, setReadingDraft] = useState({
    title: "",
    author: "",
    link: "",
  });

  const findCourse = (id) => courses.find((c) => c.id === id);
  const openCourse = (id) => {
    setActiveCourseId(id);
    const course = findCourse(id);
    setOutlineDraft(course?.outline || "");
    setActiveCourseTab("Materials");
  };

  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleUploadMaterial = async () => {
    if (!activeCourseId || !selectedFile) return;
    setUploading(true);
    await new Promise((r) => setTimeout(r, 700));

    const newMaterial = {
      id: "m" + Date.now(),
      name: selectedFile.name,
      type: selectedFile.name.split(".").pop(),
      uploadedAt: new Date().toISOString().slice(0, 10),
    };

    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId
          ? { ...c, materials: [newMaterial, ...c.materials] }
          : c
      )
    );

    setSelectedFile(null);
    setUploading(false);
  };

  const saveOutline = () => {
    if (!activeCourseId) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId ? { ...c, outline: outlineDraft } : c
      )
    );
    alert("Outline saved (frontend only). Connect to backend later.");
  };

  const openStudentsModal = (id) => {
    setActiveCourseId(id);
    setShowStudentsModal(true);
  };
  const closeStudentsModal = () => {
    setShowStudentsModal(false);
    setActiveCourseId(null);
  };

  const removeStudent = (studentId) => {
    if (!activeCourseId) return;
    if (!confirm("Remove student from course?")) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId
          ? { ...c, students: c.students.filter((s) => s.id !== studentId) }
          : c
      )
    );
  };

  const addSchedule = () => {
    if (!activeCourseId) return;
    const { type, day, time, location } = scheduleDraft;
    if (!day || !time) {
      alert("Please provide day and time for the schedule entry.");
      return;
    }
    const newSch = { id: "sch" + Date.now(), type, day, time, location };
    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId
          ? { ...c, schedule: [...c.schedule, newSch] }
          : c
      )
    );
    setScheduleDraft({ type: "Lecture", day: "", time: "", location: "" });
  };

  const startEditSchedule = (sch) => {
    setEditingScheduleId(sch.id);
    setScheduleDraft({
      type: sch.type,
      day: sch.day,
      time: sch.time,
      location: sch.location,
    });
  };

  const saveEditedSchedule = () => {
    if (!activeCourseId || !editingScheduleId) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId
          ? {
              ...c,
              schedule: c.schedule.map((s) =>
                s.id === editingScheduleId ? { ...s, ...scheduleDraft } : s
              ),
            }
          : c
      )
    );
    setEditingScheduleId(null);
    setScheduleDraft({ type: "Lecture", day: "", time: "", location: "" });
  };

  const removeSchedule = (schId) => {
    if (!activeCourseId) return;
    if (!confirm("Remove schedule entry?")) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId
          ? {
              ...c,
              schedule: c.schedule.filter((s) => s.id !== schId),
            }
          : c
      )
    );
  };

  const addReading = () => {
    if (!activeCourseId) return;
    const { title, author, link } = readingDraft;
    if (!title) {
      alert("Please provide a title for the reading.");
      return;
    }
    const newReading = { id: "r" + Date.now(), title, author, link };
    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId
          ? { ...c, readings: [newReading, ...(c.readings || [])] }
          : c
      )
    );
    setReadingDraft({ title: "", author: "", link: "" });
  };

  const removeReading = (readingId) => {
    if (!activeCourseId) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === activeCourseId
          ? {
              ...c,
              readings: (c.readings || []).filter((r) => r.id !== readingId),
            }
          : c
      )
    );
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📘 My Courses
          </h1>
          <p className="text-sm text-gray-500">
            Manage your course materials, outlines, schedules & students.
          </p>
        </div>
        <div className="text-sm text-gray-600 italic">
          Faculty Dashboard — <span className="font-semibold">Instructor View</span>
        </div>
      </div>

      {/* COURSE CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="relative group bg-gradient-to-br from-white to-indigo-50/30 backdrop-blur-sm p-6 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-start">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {course.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {course.code} • {course.semester}
                  </p>
                </div>
              </div>
              <button
                onClick={() => openCourse(course.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
              >
                <Eye size={14} /> Open
              </button>
            </div>

            {/* STATS */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                <Users size={13} /> {course.students.length} Students
              </span>
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                <Clock size={13} /> {course.schedule.length} Schedule
              </span>
            </div>

            {/* MATERIALS PREVIEW */}
            <div className="mt-5 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Upload size={15} /> Course Materials
              </h3>
              <div className="mt-2 space-y-2">
                {course.materials.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">
                    No materials uploaded yet.
                  </p>
                ) : (
                  course.materials.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-md">
                          <FileText size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-400">
                            {m.uploadedAt} • {m.type}
                          </p>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-indigo-600 hover:underline">
                        Download
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* The rest of your active course panels, modals, etc. stay unchanged */}
      {/* (No structure changes, just style improvements above) */}
    </div>
  );
}
